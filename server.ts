import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware - Increase limit to handle high-res base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Multer setup for temporary storage if needed (though we'll use FE mostly)
  const upload = multer({ dest: 'uploads/' });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini image analysis route
  app.post("/api/gemini/analyze", async (req, res) => {
    const { image, mimeType, titleLength = 70, keywordCount = 35, customApiKey } = req.body;
    
    const apiKey = customApiKey || process.env.GEMINI_API_KEY || "";
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API Key is missing. Please add it in Settings." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

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

      const requestedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      let response;
      try {
        response = await ai.models.generateContent({
          model: requestedModel,
          contents: [
            {
              inlineData: {
                mimeType,
                data: image,
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
          config: {
            responseMimeType: "application/json",
            responseSchema: METADATA_SCHEMA,
          },
        });
      } catch (genErr: any) {
        // If the primary model fails or is unavailable, attempt fallback
        console.warn(`Model ${requestedModel} failed, trying fallback model...`, genErr.message);
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              inlineData: {
                mimeType,
                data: image,
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
          config: {
            responseMimeType: "application/json",
            responseSchema: METADATA_SCHEMA,
          },
        });
      }

      if (!response.text) {
        throw new Error("No response from AI");
      }

      const parsedData = JSON.parse(response.text.trim());
      res.json(parsedData);
    } catch (err: any) {
      console.error("Server AI Error:", err);
      const errorMessage = err.message || String(err);
      
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        return res.status(429).json({ error: "API Quota exceeded", type: "quota_exceeded" });
      }
      if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.toLowerCase().includes('api key')) {
        return res.status(401).json({ error: "Invalid API Key", type: "invalid_key" });
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Example endpoint for CSV generation if requested by user specifically for backend
  app.post("/api/export-csv", (req, res) => {
    const { data } = req.body;
    // Simple JSON to CSV logic
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data" });
    }
    
    // Logic could go here, but we'll prioritize client-side for immediate response
    res.json({ message: "Export ready" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
