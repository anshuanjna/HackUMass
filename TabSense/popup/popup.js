// --- NO API KEY OR IMPORTS ---
const CHAT_URL = "https://hackumass-5h0i.onrender.com/chat";

document.addEventListener("DOMContentLoaded", () => {
  const tabGroupsContainer = document.getElementById("tab-groups");
  const searchBox = document.getElementById("searchBox");
  const settingsBtn = document.getElementById("settings-btn");


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

  // Detects category based on tab title or URL
function getCategory(tab) {
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
        const detectedCategory = getCategory(tabs[0]);
        const groupName = groupInfo.title || detectedCategory;


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

  // --- 3. EVENT LISTENERS ---
  renderRealTabs();
  searchBox.addEventListener("input", (e) => {
    renderRealTabs(e.target.value);
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