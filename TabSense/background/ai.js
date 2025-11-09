// AI logic file for categorizing tabs via your local server
const BATCH_SERVER_URL = "https://hackumass-5h0i.onrender.com/batchCategorize";

/**
 * Get group names for a whole list of tabs in a single API call.
 * @param {Array<object>} tabs - An array of tab objects (with title, url, text)
 * @returns {Promise<Array<string>>} - A list of category names
 */
export async function getBatchGroupNames(tabs) {
  try {
    const response = await fetch(BATCH_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabs: tabs }) // Send all tabs to the server
    });

    const data = await response.json(); // Expects { "categories": [...] }

    // Re-order the categories to match the original tab list
    const categoryMap = new Map(data.categories.map(c => [c.id, c.category]));
    return tabs.map((tab, i) => categoryMap.get(i) || "Misc");

  } catch (err) {
    console.error("❌ Error calling local server (Batch):", err);
    return tabs.map(t => "Misc");
  }
}