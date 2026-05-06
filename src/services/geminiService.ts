import { GoogleGenAI, Type } from "@google/genai";
import { ImageMetadata } from "../types";

const METADATA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    file_name: { type: Type.STRING, description: "Adobe Stock friendly file name without extension" },
    title: { type: Type.STRING, description: "Descriptive title for Adobe Stock, max 200 characters" },
    keywords: {
      type: Type.ARRAY,
      description: "5-50 keywords for Adobe Stock SEO, comma separated",
      items: { type: Type.STRING }
    },
    category: { type: Type.STRING },
    description: { type: Type.STRING },
    dominant_colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    objects_detected: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    mood: { type: Type.STRING },
    usage_suggestions: { type: Type.STRING }
  },
  required: [
    "file_name", "title", "keywords", "category", "description",
    "dominant_colors", "objects_detected", "mood", "usage_suggestions"
  ]
};

export async function analyzeImage(
  file: File, 
  customApiKey?: string, 
  config: { titleLength?: number; keywordCount?: number } = {}
): Promise<ImageMetadata> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "";
  const { titleLength = 70, keywordCount = 35 } = config;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is missing. Please add it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);
  const mimeType = file.type;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data.split(',')[1],
          },
        },
        {
          text: `Analyze this image for Adobe Stock. 
Generate a commercially viable, SEO-optimized title (max ${titleLength} characters).
Generate exactly ${keywordCount} high-relevance keywords (min 5, max 50). 
Keywords must be in order of relevance, lowercase, and unique. 
Ensure the metadata is professional and suitable for stock photography.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: METADATA_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(response.text) as ImageMetadata;
  } catch (e) {
    console.error("Failed to parse AI response:", response.text);
    throw new Error("Invalid metadata format returned by AI");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
