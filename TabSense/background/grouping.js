import { getBatchGroupNames } from './ai.js';
import { loadStoredContent } from './storage.js';

const CATEGORY_TO_CHROME_COLOR = {
    'Entertainment': 'red',
    'Shopping': 'purple',
    'Social': 'pink',
    'Food': 'yellow',
    'Productivity': 'blue',
    'Music': 'green',
    'Travel': 'cyan'
};

/**
 * Get the Chrome tab group color for a category
 */
function getChromeColorForCategory(categoryName) {
    return CATEGORY_TO_CHROME_COLOR[categoryName] || 'grey';
}

/**
 * Core function to group all current tabs based on smart logic.
 */
export async function groupAllTabs() {
    const allTabs = await chrome.tabs.query({ url: ['*://*/*'] }); 
    
    // Use loadStoredContent to get text for tabs
    const tabsWithContent = await loadStoredContent(allTabs);

    const tabsToGroup = [];
    const tabsToSkip = [];

    // Filter out tabs we can't or shouldn't group
    for(const tab of tabsWithContent) {
        if (tab.pinned || !tab.url || !tab.url.startsWith('http')) {
            tabsToSkip.push(tab);
        } else {
            tabsToGroup.push(tab);
        }
    }

    // 1. Get *all* categories in one go
    const categories = await getBatchGroupNames(tabsToGroup);

    // 2. Build the groups map
    const groups = new Map(); // Map<groupName, tabIds[]>
    for (let i = 0; i < tabsToGroup.length; i++) {
        const tab = tabsToGroup[i];
        const groupName = categories[i]; // Get the category from the batch list
        
        if (!groups.has(groupName)) {
            groups.set(groupName, []);
        }
        groups.get(groupName).push(tab.id);
    }

    // 3. Create/Update Chrome Tab Groups
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
                    color: getChromeColorForCategory(groupName)
                });
            }

            await chrome.tabs.group({
                groupId: groupId,
                tabIds: tabIds
            });
        }
    }
}