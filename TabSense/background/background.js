import { groupAllTabs } from './grouping.js';
import { saveTabContent, updateTopicTime, loadTopicTimes } from './storage.js';
import { getBatchGroupNames } from './ai.js';

/**
 * --- Communication and Setup ---
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.action === "GROUP_TABS") {
      try {
        await groupAllTabs();
        sendResponse({ status: "Tabs grouped successfully" });
      } catch (error) {
        sendResponse({ status: "Error grouping tabs", error: error.toString() });
      }
    } else if (request.action === "SAVE_TAB_CONTENT" && sender.tab?.id) {
      try {
        await saveTabContent(sender.tab.id, request.content);
        sendResponse({ status: "Content saved" });
      } catch (error) {
        sendResponse({ status: "Error saving content", error: error.toString() });
      }
    } else if (request.action === "GET_CATEGORY_TIMES") {
      const times = await loadTopicTimes();
      sendResponse({ times });
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(groupAllTabs);

/**
 * --- Time Tracking ---
 */
let activeTabId = null;
let activeStartTime = null;

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url || !tab.url.startsWith('http')) return;

  if (activeTabId !== null && activeStartTime !== null) {
    const prevTab = await chrome.tabs.get(activeTabId);
    const category = await getTabCategory(prevTab);
    const duration = Date.now() - activeStartTime;
    await updateTopicTime(category, duration);
    console.log(`⏱️ Tracked ${duration}ms for category: ${category}`);
  }

  activeTabId = tabId;
  activeStartTime = Date.now();
});

function fallbackCategory(tab) {
  const title = tab.title.toLowerCase();
  const url = tab.url.toLowerCase();

  if (url.includes("youtube") || url.includes("netflix") || title.includes("entertain"))
    return "Entertainment";
  if (url.includes("spotify") || url.includes("soundcloud"))
    return "Music";
  if (url.includes("instagram") || url.includes("reddit") || url.includes("x.com") || url.includes("twitter"))
    return "Social";
  if (url.includes("amazon") || url.includes("ebay") || url.includes("etsy"))
    return "Shopping";
  if (url.includes("ubereats") || url.includes("doordash") || url.includes("zomato"))
    return "Food";
  if (url.includes("notion") || url.includes("google") || url.includes("docs") || url.includes("calendar"))
    return "Productivity";
  if (url.includes("tripadvisor") || url.includes("expedia") || url.includes("airbnb"))
    return "Travel";

  return "Misc";
}

async function getTabCategory(tab) {
  const stored = await chrome.storage.local.get([String(tab.id)]);
  const content = stored[String(tab.id)] || {};
  const tabs = [{ title: tab.title, url: tab.url, text: content.text || "" }];
  const categories = await getBatchGroupNames(tabs);
  const aiCategory = categories[0] || "Misc";
  return aiCategory === "Misc" ? fallbackCategory(tab) : aiCategory;
}