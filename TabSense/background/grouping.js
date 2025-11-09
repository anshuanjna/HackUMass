import { getGroupName } from './ai.js';
import { getRandomColor } from './helpers.js';
import { loadStoredContent } from './storage.js';

// --- REMOVED THE SLEEP FUNCTION (No longer needed) ---

/**
 * Core function to group all current tabs based on smart logic.
 */
export async function groupAllTabs() {
    // FIX APPLIED: Use the correct wildcard pattern for HTTP/HTTPS URLs
    const allTabs = await chrome.tabs.query({ url: ['*://*/*'] }); 
    
    const tabsWithContent = await loadStoredContent(allTabs);
    const groups = new Map(); // Map<groupName, tabIds[]>

    // 1. Group tabs based on the AI/Smart logic
    for (const tabData of tabsWithContent) {
        
        // First, skip tabs we don't care about
        if (tabData.pinned || !tabData.url || tabData.url.startsWith('chrome://')) continue;

        // --- REMOVED THE AWAIT SLEEP() LINE ---
        // Groq is fast enough that we don't need a delay
        
        // Await the asynchronous getGroupName function
        const groupName = await getGroupName(tabData, tabData.text);
        
        if (!groups.has(groupName)) {
            groups.set(groupName, []);
        }
        groups.get(groupName).push(tabData.id);
    }

    // 2. Create/Update Chrome Tab Groups
    for (const [groupName, tabIds] of groups.entries()) {
        if (tabIds.length > 1) { 
            const existingGroups = await chrome.tabGroups.query({ title: groupName });
            let groupId;

            if (existingGroups.length > 0) {
                groupId = existingGroups[0].id;
            } else {
                groupId = await chrome.tabs.group({ tabIds: [tabIds[0]] }); 
                await chrome.tabGroups.update(groupId, {
                    title: groupName,
                    color: getRandomColor()
                });
            }

            await chrome.tabs.group({
                groupId: groupId,
                tabIds: tabIds
            });
        }
    }
}