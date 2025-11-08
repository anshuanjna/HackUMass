// Function to extract readable text from the webpage (from image_45eadb.png)
function extractPageText() {
  // Use document.body.innerText for simple text extraction
  const text = document.body?.innerText || "";
  // Limit for performance and storage
  return text.slice(0, 4000); 
}

// Send extracted text to background
// Run this function immediately after content script injection
(function sendContent() {
    // Only run on standard web pages
    if (document.body && (window.location.protocol.startsWith('http'))) { 
        chrome.runtime.sendMessage({
            action: "SAVE_TAB_CONTENT",
            content: {
                text: extractPageText(),
                timestamp: Date.now()
            }
        });
    }
})();