import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // <-- 1. IMPORTED CORSS

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // <-- 2. USING CORS (This fixes 'Failed to fetch')

// Load the Gemini key from your .env file
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment variables.");
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

// --- ROUTES ---
app.get("/", (req, res) => {
  res.send("✅ TabSense Gemini server is running!");
});

// --- 3. NEW BATCH ENDPOINT (Fixes rate limit) ---
app.post("/batchCategorize", async (req, res) => {
  const { tabs } = req.body; // Expects an array of tabs

  const tabDataForAI = tabs.map((tab, i) => ({
    id: i,
    title: tab.title || "",
    url: tab.url || "",
    text: (tab.text || "").slice(0, 500)
  }));

  const prompt = `
    You are an expert tab categorizer. Your goal is to group tabs by the user's *intent*.
    For the list of tabs below, return a valid JSON array where each object has an "id" and a "category".
    Your response MUST be ONLY the JSON array.

    CATEGORIES BY INTENT:
    - *Entertainment*: (e.g., Netflix, funny Reddit threads, youtube.com, amazon prime, hulu, disney+ , HBO Max, News )
    - *Shopping*: (e.g., Amazon, product pages, Sephora, Ulta, Walmart , Target , Macy's)
    - *Social*: (e.g., instagram.com, facebook.com, web.whatsapp.com, TikTok, Discord, LinkedIn, X , Quora)
    - *Productivity*: (e.g., Google Docs, GitHub, programming Reddit threads, Slack , Teams,meet , zoom)
    - *Food*: (e.g., UberEats, recipes)
    - *Music*: (e.g., Spotify, SoundCloud, Apple music, Shazam, Amazon Music )
    - *Travel*: (e.g., Airbnb, Google Flights, hotels, places to visit, Tripadvisor, Booking.com, Google maps, KAYAK)
    - *Misc*: If nothing else fits.
    EXAMPLE RESPONSE:
    [
      { "id": 0, "category": "Productivity" },
      { "id": 1, "category": "Social" }
    ]
    ---
    TAB LIST TO CATEGORIZE:
    ${JSON.stringify(tabDataForAI)}
    ---
    JSON RESPONSE:
    `;

  console.log("🧠 PROMPT SENT TO GEMINI (Batch)...");

  try {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );
    
    const data = await response.json();
    console.log("📥 GEMINI RAW RESPONSE (Batch):", JSON.stringify(data, null, 2));

    const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";
    const jsonText = aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '');
    const categories = JSON.parse(jsonText);

    res.json({ categories });
  } catch (error) {
    console.error("❌ Error contacting Gemini (Batch):", error);
    res.status(500).json({ error: "Gemini API request failed" });
  }
});


// --- Chatbot Endpoint ---
function buildGeminiHistory(chatHistory) {
  const contents = [];
  contents.push({
    role: "user",
    parts: [{ text: "You are TabSense, a helpful AI assistant. Be concise and friendly." }]
  });
  contents.push({
    role: "model",
    parts: [{ text: "Okay, I am TabSense. How can I help?" }]
  });
  chatHistory.forEach(item => {
    const role = (item.role === 'assistant') ? 'model' : 'user';
    contents.push({
      role: role,
      parts: [{ text: item.content }]
    });
  });
  return contents;
}

app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: "No messages provided" });
  }
  console.log("🧠 PROMPT SENT TO GEMINI (Chat)...");
  try {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "contents": buildGeminiHistory(messages)
        })
      }
    );
    const data = await response.json();
    console.log("📥 GEMINI RAW RESPONSE (Chat):", JSON.stringify(data, null, 2));
    const aiResponse = data?.candidates?.[0]?.content;
    res.json({ response: {
        role: "assistant",
        content: aiResponse?.parts?.[0]?.text || "Sorry, I had an error."
    }});
  } catch (error) {
    console.error("❌ Error contacting Gemini (Chat):", error);
    res.status(500).json({ error: "Gemini API request failed" });
  }
});

// Use the port the host gives us (like Render) or 3000 for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TabSense Gemini server running on http://localhost:${PORT}`);
});