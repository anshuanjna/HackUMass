import { groupAllTabs } from './grouping.js';
import { getGroupName } from './ai.js';
import { loadTopicTimes, updateTopicTime, saveTabContent } from './storage.js';

// A dictionary to store tab activity: {tabId: {startTime: timestamp, groupName: string}}
let tabActivity = {};
const IDLE_TIME_THRESHOLD_MS = 15000; // Time required to be active to count (15s)

/**
 * --- Time Tracking Handlers ---
 */

// 1. Handle when a tab is activated (switched to)
async function handleTabActivated(activeInfo) {
  const now = Date.now();
  const activeTabId = activeInfo.tabId;

  // 1. End time for the *previous* active tab
  for (const tabId in tabActivity) {
    if (tabActivity[tabId].endTime === 0) {
      // This was the previously active tab
      const tabData = tabActivity[tabId];
      if (now - tabData.startTime > IDLE_TIME_THRESHOLD_MS) {
        const duration = now - tabData.startTime;
        // NOTE: updateTopicTime must be awaited
        await updateTopicTime(tabData.groupName, duration);
      }
      tabData.endTime = now; // Mark as ended
    }
  }

  // 2. Start time for the *new* active tab
  try {
    const activeTab = await chrome.tabs.get(activeTabId);
    if (activeTab.url && activeTab.url.startsWith('http')) {
        // CRITICAL CHANGE: getGroupName is now ASYNC (calls Gemini API), so it must be awaited here.
        const groupName = await getGroupName(activeTab); 

        tabActivity[activeTabId] = {
            startTime: now,
            endTime: 0,
            groupName: groupName
        };
    }
  } catch (e) {
      // Ignore errors for tabs like chrome://newtab/ or when tab is closed
  }
}

// 2. Handle tab closing (ensure time is logged)
// NOTE: This listener does NOT need to be async because it uses updateTopicTime 
// which is a promise, and we don't need to wait for its result before finishing.
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabActivity[tabId] && tabActivity[tabId].endTime === 0) {
    const now = Date.now();
    const tabData = tabActivity[tabId];
    if (now - tabData.startTime > IDLE_TIME_THRESHOLD_MS) {
        const duration = now - tabData.startTime;
        // updateTopicTime is called but not awaited (fire-and-forget is acceptable here)
        updateTopicTime(tabData.groupName, duration); 
    }
    delete tabActivity[tabId];
  }
});


/**
 * --- Communication and Setup ---
 */

// Listener for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Wrap async logic in an immediately-invoked async function (IIAFE)
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
        
        // Message from Popup: Get Analytics Data
        } else if (request.action === "GET_TOPIC_TIMES") {
            try {
                const topicTimes = await loadTopicTimes();
                sendResponse({ status: "Success", topicTimes: topicTimes });
            } catch (error) {
                sendResponse({ status: "Error", error: error.toString() });
            }
        
        // Message from Popup: Clear Analytics Data
        } else if (request.action === "CLEAR_TOPIC_TIMES") {
            try {
                // Uses the standard Chrome storage removal API
                await chrome.storage.local.remove('topicTimes');
                sendResponse({ status: "Analytics cleared" });
            } catch (error) {
                sendResponse({ status: "Error clearing data", error: error.toString() });
            }
        }
    })();
    
    // IMPORTANT: Return true to signal that sendResponse will be called asynchronously.
    return true; 
});

// Initial setup and listeners
chrome.tabs.onActivated.addListener(handleTabActivated);

// Run grouping when the extension is first installed/updated
chrome.runtime.onInstalled.addListener(groupAllTabs);