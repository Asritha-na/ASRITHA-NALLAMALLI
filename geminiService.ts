
import { GoogleGenAI, Type } from "@google/genai";
import { SafetyLevel, AnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SCHEMA_ANALYSIS = {
  type: Type.OBJECT,
  properties: {
    level: {
      type: Type.STRING,
      description: "The safety level: SAFE, SUSPICIOUS, or DANGEROUS",
    },
    explanation: {
      type: Type.STRING,
      description: "A short, non-technical explanation of why this was flagged.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable steps for the user.",
    },
  },
  required: ["level", "explanation", "recommendations"],
};

export const analyzeContent = async (content: string, type: 'message' | 'upi' | 'profile'): Promise<AnalysisResult> => {
  let prompt = "";
  if (type === 'message') {
    prompt = `Analyze this message/URL for potential scams: "${content}". Use simple language. Identify if it's phishing or a malicious link.`;
  } else if (type === 'upi') {
    prompt = `Analyze these UPI payment details for fraud risk: "${content}". 
    Look for red flags like:
    1. Urgency in the purpose (e.g., "Pay now or account blocked").
    2. Refund scam patterns (e.g., "Receive refund by entering PIN").
    3. Mismatch between Payee Name and common professional patterns.
    4. Suspicious UPI ID formats.
    Provide a verdict for a non-technical user.`;
  } else {
    prompt = `Analyze this social profile for impersonation risk: "${content}". Check for common fake account traits.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA_ANALYSIS,
        temperature: 0.1,
      },
    });
    const data = JSON.parse(response.text || "{}");
    return {
      level: (data.level?.toUpperCase() as SafetyLevel) || SafetyLevel.SUSPICIOUS,
      explanation: data.explanation || "Unable to analyze.",
      recommendations: data.recommendations || ["Be careful."]
    };
  } catch (error) {
    return { level: SafetyLevel.SUSPICIOUS, explanation: "Error checking.", recommendations: ["Try later."] };
  }
};

export const getCyberSecurityAdvice = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are CyberGuardian, a helpful safety assistant. Answer this query in simple terms for a non-technical user: "${query}"`,
    });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch {
    return "Something went wrong. Please check your internet.";
  }
};

export const getDailySafetyTip = async (): Promise<{ title: string; content: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a catchy cybersecurity tip for an Indian user.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
          required: ["title", "content"]
        }
      }
    });
    return JSON.parse(response.text || '{"title":"Stay Safe","content":"Never share OTP."}');
  } catch {
    return { title: "Safety First", content: "Never share your UPI PIN or OTP with anyone." };
  }
};
