/// --- Storage Functions ---

// Save extracted text and timestamp for a tab's content
export async function saveTabContent(tabId, content) {
    // Use modern promise-based API directly
    await chrome.storage.local.set({ [tabId]: content });
}

// Load stored text for a list of tabs
export async function loadStoredContent(tabs) {
    const tabIds = tabs.map(t => String(t.id));
    const stored = await chrome.storage.local.get(tabIds); 

    return tabs.map(t => {
        const storedData = stored[String(t.id)];
        return {
            id: t.id,
            title: t.title,
            url: t.url,
            // Check for existence and structure
            text: storedData?.text || "", 
            timestamp: storedData?.timestamp || null
        };
    });
}

// --- Topic Time Tracking Storage ---

const TOPIC_TIMES_KEY = 'topicTimes';

// Load all topic times
export async function loadTopicTimes() {
    const data = await chrome.storage.local.get(TOPIC_TIMES_KEY);
    return data[TOPIC_TIMES_KEY] || {};
}

// Update time for a specific topic/group
export async function updateTopicTime(groupName, durationMs) {
    const topicTimes = await loadTopicTimes();
    topicTimes[groupName] = (topicTimes[groupName] || 0) + durationMs;
    await chrome.storage.local.set({ [TOPIC_TIMES_KEY]: topicTimes });
}

// Clear all topic times 
export async function clearTopicTimes() {
    await chrome.storage.local.remove(TOPIC_TIMES_KEY);
}