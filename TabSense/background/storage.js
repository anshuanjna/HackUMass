//  Save extracted text for a tab
export function saveTabContent(tabId, content) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [tabId]: content }, resolve);
    });
}

// Load stored text for a list of tabs
export async function loadStoredContent(tabs) {
    const stored = await chrome.storage.local.get(null);

    return tabs.map(t => ({
        id: t.id,
        title: t.title,
        url: t.url,
        text: stored[t.id]?.text || "",
        timestamp: stored[t.id]?.timestamp || null
    }));
}
