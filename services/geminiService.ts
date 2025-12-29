
import { GoogleGenAI, Type } from "@google/genai";

// Use gemini-3-flash-preview for basic text tasks like chat and summarization
export const getGeminiChatResponse = async (userMessage: string, contextData: any = {}) => {
  // Always use process.env.API_KEY directly in the constructor and instantiate right before usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Inject the "database" state as system context
  const systemPrompt = `
    You are BananaBot, the AI core for BananaBiz Event Platform.
    CURRENT SYSTEM STATE (MOCK DATABASE):
    - Users: ${JSON.stringify(contextData.users || [])}
    - Active Events: ${JSON.stringify(contextData.events || [])}
    - Active User Role: ${contextData.currentUser?.role || 'Guest'}
    
    GUIDELINES:
    1. Answer queries about events, bookings, and business management.
    2. If a user asks for analytics, summarize the provided data.
    3. If a user asks for specific event details, use the data above.
    4. Be professional, efficient, and friendly.
    5. Always mention that you are powered by Gemini 3 Flash.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
    }
  });

  return response.text;
};

// Use gemini-3-pro-preview for complex reasoning tasks like marketplace analysis
export const generateMarketplaceInsights = async (events: any[], bookings: any[]) => {
  // Always use process.env.API_KEY directly in the constructor and instantiate right before usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze these events and bookings and return a high-level performance insight:
    Events: ${JSON.stringify(events)}
    Bookings: ${JSON.stringify(bookings)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topPerformingEvent: { type: Type.STRING },
          revenueOpportunity: { type: Type.STRING },
          growthSuggestion: { type: Type.STRING }
        },
        required: ["topPerformingEvent", "revenueOpportunity", "growthSuggestion"],
        propertyOrdering: ["topPerformingEvent", "revenueOpportunity", "growthSuggestion"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
