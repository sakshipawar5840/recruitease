import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateJobDescription = async (title: string, skills: string, companyName: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate description.";

  try {
    const prompt = `
      Write a professional and attractive job description for the position of "${title}" at "${companyName}".
      Key skills required: ${skills}.
      The tone should be professional yet welcoming to students.
      Include sections for: About the Role, Key Responsibilities, and Required Skills.
      Keep it under 300 words.
      Format with markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const chatWithAI = async (message: string, context: string): Promise<string> => {
  if (!apiKey) return "I'm sorry, I cannot respond right now (API Key missing).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        System: You are a helpful HR Assistant bot for RecruitEase, a campus recruitment portal.
        Context: ${context}
        User: ${message}
        Response (keep it concise and helpful):
      `,
    });
    return response.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble thinking right now.";
  }
};

export const analyzeCandidateMatch = async (jobDescription: string, studentProfile: string): Promise<number> => {
  if (!apiKey) return Math.floor(Math.random() * 40) + 60; // Fallback random score 60-100

  try {
    const prompt = `
      Rate the candidate match for this job on a scale of 0 to 100 based on the description and profile.
      Job Description: ${jobDescription.substring(0, 500)}...
      Student Profile: ${studentProfile}
      
      Return ONLY the number. Nothing else.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const score = parseInt(response.text?.trim() || "75");
    return isNaN(score) ? 75 : score;
  } catch (error) {
    return 75;
  }
};