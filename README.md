# HackUMass
## 🚀 TabSense
## Smart Tab Management for Smarter Browsing

Built at HackUMass 2025

TabSense is a Chrome extension that organizes your browser tabs by categories such as Social, Productivity, and Entertainment, while tracking how much time you spend in each.
Using the Google Gemini API, it intelligently classifies tabs based on content, helping you take control of your browsing habits through a clean, intuitive popup interface.

## 🧩 Overview

Whether you’re juggling research, projects, or just too many open tabs, TabSense declutters your workspace by automatically grouping tabs by context and tracking time spent on each category.
The result: better focus, digital mindfulness, and awareness of your online habits.

## ✨ Features

🧠 AI-Powered Categorization – Uses the Gemini API to intelligently group tabs by purpose and content.

🗂️ Automatic Grouping – Sorts open tabs into categories like Social, Productivity, Entertainment, etc.

⏱️ Time Tracking – Monitors how long you spend in each category (e.g., “12 min on Social”).

⚡ Quick Access Interface – Manage, search, and navigate tabs easily from a sleek popup.

🔧 Full Tab Control – Activate, close, or search tabs directly within the extension.

🚀 Fast & Efficient – Processes multiple tabs quickly with minimal lag.

## 🛠️ Installation

- Clone or download this repository.
- Open chrome://extensions in your browser.
- Enable Developer Mode (toggle in the top-right).
- Click Load Unpacked.
- Select the project folder.

## ⚙️ How It Works?

 🔍 Tab Categorization
- TabSense uses a hybrid classification system:
- Heuristic Matching (e.g., youtube.com → Entertainment).
- AI Classification via the Gemini API:
- Extracts tab content.
- Sends it to Gemini for analysis.
- Receives a semantic category (like Productivity or Social).
- Stores it for grouping and time tracking.

 ⏰ Time Tracking
- Uses chrome.tabs.onActivated to track activity.
- When switching tabs:
- Calculates time spent on the previous tab.
- Determines its category.
- Updates cumulative time in chrome.storage.local.

  
  <img width="278" height="394" alt="image" src="https://github.com/user-attachments/assets/5f5f69be-63bd-45ad-84cf-f9c400edc769" />





  <img width="282" height="272" alt="image" src="https://github.com/user-attachments/assets/a7dfbab0-7127-4b34-84d0-e036dfe3935d" />



  <img width="695" height="39" alt="image" src="https://github.com/user-attachments/assets/3f5b825f-f74d-4d1b-a580-dec579e36153" />




## 🧭 Popup UI & Tab Control
- Tabs are visually grouped by category with icons and color accents.
- Displays total time spent per category.
  
Users can:

🔍 Search tabs by title or URL

❌ Close tabs

🧭 Switch instantly between tabs

🌀 Trigger full regrouping

## 🧠 Gemini API Integration
- TabSense leverages the Gemini API for deep contextual understanding:
- Tab content is saved using saveTabContent().
- When switching tabs, getTabCategory() calls getBatchGroupNames() from ai.js.
- This sends tab data to Gemini and retrieves a category label.
- The label is used for grouping and time tracking.
- This enables semantic understanding beyond simple URL-based categorization

## Tech Stack 
- Extension Core --> JavaScript + Chrome Extension APIs
- UI --> CSS + HTML
- Storage --> chrome.storage.local
- Categorization - Heuristics +Gemini API 

## Privacy

TabSense processes tab information using the Gemini API. Please review Google's API terms of service and ensure you're comfortable with tab data being sent to the API for analysis.

## Requirements

- Modern web browser (Chrome, Edge, or Chromium-based)
- Active internet connection
- Valid Gemini API key

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Powered by [Google Gemini API](https://ai.google.dev/)
- Built for better tab management and productivity
