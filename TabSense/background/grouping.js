import { getGroupName } from './ai.js';
import { getRandomColor } from './helpers.js';
import { loadStoredContent } from './storage.js';

/**
 * Core function to group all current tabs based on smart logic.
 */
export async function groupAllTabs() {
    const allTabs = await chrome.tabs.query({ url: ['*://*/*'] });
    const tabsWithContent = await loadStoredContent(allTabs);
    const groups = new Map(); // Map<groupName, tabIds[]>

    // 1. Group tabs based on the AI/Smart logic
    for (const tabData of tabsWithContent) {
        if (tabData.pinned || !tabData.url) continue;

        // Use the stored text content for deeper grouping
        const groupName = getGroupName(tabData, tabData.text);
        if (!groups.has(groupName)) {
            groups.set(groupName, []);
        }
        groups.get(groupName).push(tabData.id);
    }

    // 2. Create/Update Chrome Tab Groups
    for (const [groupName, tabIds] of groups.entries()) {
        if (tabIds.length > 1) { // Only group if there's more than one tab
            const existingGroups = await chrome.tabGroups.query({ title: groupName });
            let groupId;

            if (existingGroups.length > 0) {
                // Use the first existing group
                groupId = existingGroups[0].id;
            } else {
                // Create a new group
                groupId = await chrome.tabs.group({ tabIds: [tabIds[0]] }); // Group the first one to get ID
                await chrome.tabGroups.update(groupId, {
                    title: groupName,
                    color: getRandomColor()
                });
            }

            // Add all tabs to the group (the first one is already there)
            await chrome.tabs.group({
                groupId: groupId,
                tabIds: tabIds
            });
        }
    }
}