import { GoogleGenAI } from "@google/genai";

const geminiResponse = async (command, assistantName, userName) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key is missing");
            return null;
        }

        const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `
You are a virtual assistant named ${assistantName || "Assistant"} created by ${userName || "the user"}.
You are not Google. You will now behave like a voice-enabled assistant.
Your task is to understand the user's natural language input and respond with a JSON object like this:
{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
          "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" |
          "instagram_open" | "facebook_open" | "weather-show",
  "userInput": "<cleaned user input>" (only remove your name from userInput if exists; if asked to search on Google or YouTube, userInput should contain only the search text, e.g., "js"),
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- Return only a valid JSON object with keys: type, userInput, and response.
- "type": determine the intent of the user.
- "userInput": cleaned query text as described above.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question, e.g., "Who is the president of the USA?", "What is AI?", you should answer briefly in "response", give answer if you know and explain it to user.
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video or song.
- "calculator_open": if user wants to open a calculator.
- "instagram_open": if user wants to open Instagram.
- "facebook_open": if user wants to open Facebook.
- "weather-show": if user wants to know weather.
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.

Important:
- Use "{author name}" if someone asks who created you.
- Only respond with the JSON object, nothing else.

Now your userInput - (${command || ""})
`;

        const result = await ai.models.generateContent({
            model,
            contents: systemPrompt,
        });

        const text = result?.text;
        return typeof text === "string" ? text.trim() : null;
        
    } catch (error) {
        console.error(
            "Gemini API error:",
            error?.status,
            error?.message || error
        );

        // Always return null on failure so callers can handle it safely
        return null;
    }
}

export default geminiResponse
