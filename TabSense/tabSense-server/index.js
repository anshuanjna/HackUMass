import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // <-- 1. IMPORT IT HERE

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // <-- 2. USE IT HERE (This allows all origins)

// Load the Groq key from your .env file
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY not found in environment variables.");
  process.exit(1);
}

// --- ROUTES ---

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ TabSense Groq server is running!");
});

// ✅ Categorization endpoint
app.post("/categorize", async (req, res) => {
  const { title = "", url = "", text = "" } = req.body;

  // This is your prompt, which is perfect
  const prompt = `
    You are a tab categorizer. Your ONLY job is to assign a single category
    from the list below. Do not make up your own categories.

    CATEGORIES:
    - Entertainment
    - Shopping
    - Social
    - Food
    - Productivity
    - Music
    - Travel
    - Misc

    Respond with ONLY one category name from the list.
    If nothing fits, respond "Misc".

    ---
    Title: ${title}
    URL: ${url}
    Content: ${text.slice(0, 500)}
    ---

    CATEGORY:
    `;

  console.log("🧠 PROMPT SENT TO GROQ:", prompt.slice(0, 250), "...");

  try {
    // --- Send request to Groq ---
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions", // Groq's URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}` // Groq auth header
        },
        body: JSON.stringify({
          // Groq uses the chat-style 'messages' format
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          // This is the new, correct model you confirmed
          "model": "llama-3.1-8b-instant" 
        }),
      }
    );

    const data = await response.json();

    // --- Log raw response for debugging ---
    console.log("📥 GROQ RAW RESPONSE:", JSON.stringify(data, null, 2));

    // --- Parse Groq's response format ---
    const category =
      data?.choices?.[0]?.message?.content?.trim() || "Misc";

    res.json({ category });
  } catch (error) {
    console.error("❌ Error contacting Groq:", error);
    res.status(500).json({ error: "Groq API request failed" });
  }
});

// --- Start server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 TabSense Groq server running on http://localhost:${PORT}`);
});