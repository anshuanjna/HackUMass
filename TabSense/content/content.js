// Extract readable text from the webpage
function extractPageText() {
    const text = document.body?.innerText || "";
    return text.slice(0, 2000); // limit for performance
}

// Send extracted text to background
chrome.runtime.sendMessage({
    action: "SAVE_TAB_CONTENT",
    content: {
        text: extractPageText(),
        timestamp: Date.now()
    }
});
