// --- NO API KEY OR IMPORTS ---
const CHAT_URL = "http://localhost:3000/chat";

document.addEventListener("DOMContentLoaded", () => {
  const tabGroupsContainer = document.getElementById("tab-groups");
  const searchBox = document.getElementById("searchBox");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const settingsBtn = document.getElementById("settings-btn");
  
  let chatHistory = []; 

  const categoryStyles = {
    "Entertainment": { class: "entertainment", icon: "🎥" },
    "Shopping": { class: "shopping", icon: "🛍️" },
    "Social": { class: "social", icon: "👥" },
    "Food": { class: "food", icon: "🍔" },
    "Productivity": { class: "productivity", icon: "📝" },
    "Music": { class: "music", icon: "🎵" },
    "Travel": { class: "travel", icon: "✈️" },
    "Misc": { class: "productivity", icon: "📎" }
  };

  // --- 1. RENDER THE REAL TABS ---
  async function renderRealTabs(query = "") {
    tabGroupsContainer.querySelectorAll('.chat-message').forEach(el => el.remove());
    tabGroupsContainer.querySelectorAll('.tab-group').forEach(el => el.remove());

    const allTabs = await chrome.tabs.query({});
    const tabsByGroupId = {};
    for (const tab of allTabs) {
      if (tab.groupId === chrome.tabs.TAB_ID_NONE) continue;
      if (!tabsByGroupId[tab.groupId]) {
        tabsByGroupId[tab.groupId] = [];
      }
      tabsByGroupId[tab.groupId].push(tab);
    }

    for (const groupId in tabsByGroupId) {
      const tabs = tabsByGroupId[groupId];
      try {
        const groupInfo = await chrome.tabGroups.get(parseInt(groupId));
        const groupName = groupInfo.title || "Misc";

        const queryLower = query.toLowerCase();
        const matchingTabs = tabs.filter(t => 
          t.title.toLowerCase().includes(queryLower) || 
          t.url.toLowerCase().includes(queryLower)
        );

        if (matchingTabs.length === 0 && query.length > 0) continue; 

        const { class: theme, icon } = categoryStyles[groupName] || categoryStyles["Misc"];
        const section = document.createElement("section");
        section.classList.add("tab-group", theme);

        let tabItemsHTML = "";
        for (const tab of matchingTabs) {
          tabItemsHTML += `
            <div class="tab-item" data-tab-id="${tab.id}" title="${tab.title}">
              <img src="${tab.favIconUrl || 'icon.png'}" class="favicon" alt="">
              <span>${tab.title.slice(0, 35)}...</span>
              <button class="close-btn" data-tab-id="${tab.id}">×</button>
            </div>
          `;
        }
        
        if(tabItemsHTML.length > 0) {
            section.innerHTML = `<h2>${icon || ""} ${groupName}</h2>${tabItemsHTML}`;
            tabGroupsContainer.appendChild(section);
        }
      } catch (e) {
        console.warn("Couldn't render a tab group (it might have been deleted):", e);
      }
    }
  }

  // --- 2. CHATBOT FUNCTIONALITY ---
  
  function addChatMessage(role, text) {
    const div = document.createElement("div");
    div.classList.add("chat-message", `${role}-message`);
    div.textContent = text;
    tabGroupsContainer.prepend(div); 
  }

  async function handleSendChat() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = ""; 
    addChatMessage("user", userMessage);
    chatHistory.push({ role: "user", content: userMessage });

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();

      if (data.response) {
        chatHistory.push(data.response);
        addChatMessage("assistant", data.response.content);
      } else {
        addChatMessage("assistant", "Sorry, I had an error.");
      }

    } catch (err) {
      console.error("❌ Error calling local server (Chat):", err);
      addChatMessage("assistant", "Sorry, I couldn't connect to the server.");
    }
  }

  // --- 3. EVENT LISTENERS ---
  renderRealTabs();
  searchBox.addEventListener("input", (e) => {
    renderRealTabs(e.target.value);
  });
  
  sendBtn.addEventListener("click", handleSendChat);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendChat();
  });

  tabGroupsContainer.addEventListener("click", (e) => {
    const tabItem = e.target.closest('.tab-item');
    const closeBtn = e.target.closest('.close-btn');
    if (closeBtn) {
      const tabId = parseInt(closeBtn.dataset.tabId);
      chrome.tabs.remove(tabId);
      closeBtn.parentElement.remove();
    } else if (tabItem) {
      const tabId = parseInt(tabItem.dataset.tabId);
      chrome.tabs.get(tabId, (tab) => {
        chrome.tabs.update(tabId, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  });

  // This button is now your "Group Tabs" button
  settingsBtn.title = "Group All Tabs";
  settingsBtn.textContent = "🌀"; // Re-group icon
  settingsBtn.addEventListener("click", () => {
    settingsBtn.textContent = "..."; // Show loading
    // Send message to background to run the batch grouping
    chrome.runtime.sendMessage({ action: "GROUP_TABS" }, (response) => {
      console.log(response.status);
      renderRealTabs(); // Re-render the tabs in the popup
      settingsBtn.textContent = "🌀"; // Reset icon
    });
  });
});