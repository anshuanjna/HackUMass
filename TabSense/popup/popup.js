document.addEventListener("DOMContentLoaded", () => {
  const tabGroupsContainer = document.getElementById("tab-groups");
  const searchBox = document.getElementById("searchBox");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  // 🧩 Category → CSS class + emoji
  const categoryStyles = {
    "Entertainment": { class: "entertainment", icon: "🎥" },
    "Shopping": { class: "shopping", icon: "🛍️" },
    "Social": { class: "social", icon: "👥" },
    "Food": { class: "food", icon: "🍔" },
    "Productivity": { class: "productivity", icon: "📝" },
    "Music": { class: "music", icon: "🎵" },
    "Travel": { class: "travel", icon: "✈️" }
  };

  // Mock data (replace with background.js later)
  const tabData = {
    "Entertainment": ["YouTube - Trailer", "Netflix - Stranger Things"],
    "Shopping": ["Amazon - Headphones", "Etsy - Handmade Art"],
    "Social": ["Instagram - Feed", "Twitter - Notifications"],
    "Food": ["UberEats - Pizza", "Yelp - Restaurants Nearby"],
    "Productivity": ["Google Docs - Report", "Notion - Task Board"],
    "Music": ["Spotify - Lofi Playlist", "SoundCloud - Remix"],
    "Travel": ["Airbnb - NYC Stay", "Skyscanner - Flight Deals"]
  };

  function renderTabs(data) {
    tabGroupsContainer.innerHTML = "";
    for (const [group, tabs] of Object.entries(data)) {
      const { class: theme, icon } = categoryStyles[group] || {};
      const section = document.createElement("section");
      section.classList.add("tab-group", theme);
      section.innerHTML = `<h2>${icon || ""} ${group}</h2>`;
      tabs.forEach(tab => {
        const div = document.createElement("div");
        div.classList.add("tab-item");
        div.innerHTML = `<span>${tab}</span><button class="close-btn">×</button>`;
        section.appendChild(div);
      });
      tabGroupsContainer.appendChild(section);
    }
  }

  renderTabs(tabData);

  // Search filter
  searchBox.addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    const filtered = {};
    for (const [group, tabs] of Object.entries(tabData)) {
      const matches = tabs.filter(t => t.toLowerCase().includes(query));
      if (matches.length) filtered[group] = matches;
    }
    renderTabs(filtered);
  });

  // optional chatbot
  sendBtn.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    alert(`Chatbot: “Got it — ${msg}”`);
    chatInput.value = "";
  });
});
