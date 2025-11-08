// Load saved settings when the page opens
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("settings", (data) => {
    const s = data.settings || {};
    document.getElementById("toggle-ai").checked = s.aiEnabled || false;
    document.getElementById("auto-close").checked = s.autoClose || false;
    document.getElementById("theme-switch").checked = s.theme === "dark";
    document.querySelector(`input[name='view-mode'][value='${s.viewMode || "intent"}']`).checked = true;
    document.getElementById("privacy-ai").checked = s.privacyAI || false;
  });
});

// Save settings when changed
document.querySelectorAll("input").forEach(el => {
  el.addEventListener("change", () => {
    const settings = {
      aiEnabled: document.getElementById("toggle-ai").checked,
      autoClose: document.getElementById("auto-close").checked,
      theme: document.getElementById("theme-switch").checked ? "dark" : "light",
      viewMode: document.querySelector("input[name='view-mode']:checked").value,
      privacyAI: document.getElementById("privacy-ai").checked,
    };
    chrome.storage.local.set({ settings });
  });
});
