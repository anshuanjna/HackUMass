import { groupAllTabs } from './grouping.js';
import { saveTabContent } from './storage.js';

/**
 * --- Communication and Setup ---
 */

// Listener for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        // Message from Popup: Trigger Tab Grouping
        if (request.action === "GROUP_TABS") {
            try {
                await groupAllTabs();
                sendResponse({ status: "Tabs grouped successfully" });
            } catch (error) {
                sendResponse({ status: "Error grouping tabs", error: error.toString() });
            }
        
        // Message from Content Script: Save Tab Content
        } else if (request.action === "SAVE_TAB_CONTENT" && sender.tab?.id) {
            try {
                await saveTabContent(sender.tab.id, request.content);
                sendResponse({ status: "Content saved" });
            } catch (error) {
                sendResponse({ status: "Error saving content", error: error.toString() });
            }
        
        }
    })();
    
    return true; 
});


// Run a full grouping when the extension is first installed
chrome.runtime.onInstalled.addListener(groupAllTabs);
chrome.runtime.sendMessage({ action: "GROUP_TABS" });
