import { GoogleGenAI, Type } from "@google/genai";
import { AIResponseTask, TaskCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScheduleFromInput = async (
  userInput: string,
  currentDate: string
): Promise<AIResponseTask[]> => {
  try {
    const prompt = `
      You are an expert daily planner and productivity assistant.
      The user will provide a brain dump of tasks, goals, or a rough plan for their day (${currentDate}).
      Your goal is to organize this into a structured, realistic daily schedule.
      
      Rules:
      1. approximate realistic start times if not specified (default to starting around 09:00 if undefined).
      2. Keep durations realistic.
      3. categorize each task.
      4. Ensure times are in HH:MM 24-hour format.
      5. Do not overlap tasks unless explicitly implied.
      6. Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              startTime: { type: Type.STRING, description: "HH:MM format" },
              durationMinutes: { type: Type.INTEGER },
              category: { 
                type: Type.STRING, 
                enum: [
                  TaskCategory.WORK, 
                  TaskCategory.PERSONAL, 
                  TaskCategory.HEALTH, 
                  TaskCategory.LEARNING, 
                  TaskCategory.OTHER
                ] 
              }
            },
            required: ["title", "startTime", "durationMinutes", "category"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponseTask[];
    }
    return [];
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error("Failed to generate schedule from AI.");
  }
};
