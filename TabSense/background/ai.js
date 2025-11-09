// AI logic file for categorizing tabs via your local Gemini server
const SERVER_URL = "http://localhost:3000/categorize";

/**
 * Get a smart group name for a tab by calling the Gemini server.
 * @param {object} tabData - Tab info (title, url, etc.)
 * @param {string} text - Extracted text content
 * @returns {Promise<string>} - Group name
 */
export async function getGroupName(tabData, text = "") {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: tabData.title || "",
        url: tabData.url || "",
        text: text || ""
      })
    });

    const data = await response.json();

    if (data.category) {
      console.log(`🔮 Groq grouped "${tabData.title}" → ${data.category}`);
      return data.category;
    } else {
      console.warn("⚠️ No category returned, defaulting to Misc");
      return "Misc";
    }
  } catch (err) {
    console.error("❌ Error calling Groq server:", err);
    return "Misc";
  }
}
