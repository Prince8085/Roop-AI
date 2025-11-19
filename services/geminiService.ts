import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResponse } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Standard safety settings for all requests
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper to strip Data URL prefix if present
const getBase64 = (data: string) => {
    if (data.includes('base64,')) {
        return data.split('base64,')[1];
    }
    return data;
};

/**
 * Analyzes a face using Gemini 3 Pro (Thinking model) for deep analysis.
 */
export const analyzeFace = async (dataUrlOrBase64: string): Promise<AnalysisResponse> => {
  const model = "gemini-3-pro-preview";
  const base64Image = getBase64(dataUrlOrBase64);
  
  // RoopAI Master Prompt for Analysis
  const prompt = `
  Act as a professional celebrity stylist for the Indian demographic. Analyze this user's selfie.
  
  Output strict JSON with these details:
  1. face_shape: (oval, round, square, heart, diamond, oblong).
  2. hair_type: (straight, wavy, curly, coily) + texture (fine, medium, thick).
  3. current_style: Brief description of current hair.
  4. skin_undertone: (cool, warm, neutral, olive) - specific to Indian skin tones.
  5. confidence_score: 0.0 to 1.0.
  6. recommended_styles: Array of 4 distinct styles (1 professional, 1 trendy/bollywood, 1 traditional/wedding, 1 low-maintenance).
     - style_name: Catchy name.
     - description: Why it suits their face shape.
     - salon_difficulty: easy/medium/hard.
     - maintenance_level: low/medium/high.
  
  Ensure the response is valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        safetySettings,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            face_analysis: {
              type: Type.OBJECT,
              properties: {
                face_shape: { type: Type.STRING },
                hair_type: { type: Type.STRING },
                current_style: { type: Type.STRING },
                skin_undertone: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER }
              },
              required: ["face_shape", "hair_type", "confidence_score"]
            },
            recommended_styles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style_name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  confidence_score: { type: Type.NUMBER },
                  salon_difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
                  maintenance_level: { type: Type.STRING, enum: ["low", "medium", "high"] }
                },
                required: ["style_name", "description"]
              }
            }
          },
          required: ["face_analysis", "recommended_styles"]
        },
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResponse;
  } catch (error) {
    console.error("Face analysis failed:", error);
    throw error;
  }
};

/**
 * Generates or Edits an image using Gemini 2.5 Flash Image.
 */
export const generateStylePreview = async (dataUrlOrBase64: string, promptDetail: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  const base64Image = getBase64(dataUrlOrBase64);

  // Enhanced Prompt for Photorealism
  const masterPrompt = `
    Transform the person in this image with the following hairstyle: ${promptDetail}.
    
    CRITICAL INSTRUCTIONS:
    - Maintain the exact facial identity, skin texture, and lighting of the original photo.
    - The hair should look 100% photorealistic, with individual strands visible, reacting to the original lighting.
    - Ensure the hairline looks natural and blends with the skin.
    - Target Indian aesthetic standards.
    - Output a high-quality, photorealistic portrait.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          { text: masterPrompt }
        ]
      },
      config: {
        safetySettings,
        responseModalities: [Modality.IMAGE]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts[0]?.inlineData?.data) {
        return `data:image/png;base64,${parts[0].inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Style generation failed:", error);
    throw error;
  }
};

/**
 * Generates Virtual Try-On using two images (Person + Cloth).
 */
export const generateTryOn = async (personDataUrl: string, clothingDataUrl: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  const personBase64 = getBase64(personDataUrl);
  const clothingBase64 = getBase64(clothingDataUrl);
  
  // Advanced Virtual Try-On Prompt
  const prompt = `
    Perform a high-end virtual try-on.
    
    Input 1: Person. Input 2: Clothing Item.
    
    Task:
    - Dress the person in Input 1 with the clothing from Input 2.
    - PRESERVE: Facial identity, body pose, skin tone, and background details of the person exactly.
    - SIMULATE: Realistic fabric physics (draping, folds, tension) appropriate for the material.
    - ADJUST: Lighting and shadows of the clothing to match the person's environment.
    - FIT: Ensure the clothing fits the body shape naturally (not just a flat overlay).
    - AESTHETIC: High-definition fashion photography.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: personBase64 } },
          { inlineData: { mimeType: "image/jpeg", data: clothingBase64 } }
        ]
      },
      config: {
        safetySettings,
        responseModalities: [Modality.IMAGE]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts[0]?.inlineData?.data) {
        return `data:image/png;base64,${parts[0].inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Try-on generation failed:", error);
    throw error;
  }
};

/**
 * Fast chat response using Gemini 2.0 Flash for low latency interaction.
 */
export const getChatResponse = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const model = "gemini-2.0-flash"; 
  
  try {
    const chat = ai.chats.create({
      model,
      history: history,
      config: {
        safetySettings,
        systemInstruction: "You are RoopAI, a top-tier Indian fashion stylist assistant. You know everything about Indian ethnic wear (Sarees, Kurtas, Sherwanis) and Western trends. Be concise, trendy, and helpful. Use emojis. Speak in a mix of English and Hinglish if appropriate for a friendly vibe."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't understand that, sorry!";
  } catch (error) {
    console.error("Chat failed:", error);
    return "I'm having trouble connecting to the fashion styling network right now.";
  }
};

/**
 * Deep styling advice using Gemini 3 Pro (Thinking).
 */
export const getExpertAdvice = async (query: string): Promise<string> => {
    const model = "gemini-3-pro-preview";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: query,
            config: {
                safetySettings,
                thinkingConfig: { thinkingBudget: 1024 }
            }
        });
        return response.text || "Could not generate advice.";
    } catch (error) {
        console.error(error);
        throw error;
    }
}