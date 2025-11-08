// Save extracted text for a tab
function saveTabContent(tabId, content) {
    chrome.storage.local.set({ [tabId]: content });
}

// Load stored text for every tab
async function loadStoredContent(tabs) {
    const stored = await chrome.storage.local.get(null);

    return tabs.map(t => ({
        id: t.id,
        title: t.title,
        url: t.url,
        text: stored[t.id]?.text || ""
    }));
}
