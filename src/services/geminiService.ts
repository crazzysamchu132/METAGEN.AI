import { ImageMetadata } from "../types";

export async function analyzeImage(
  file: File, 
  customApiKey?: string, 
  config: { titleLength?: number; keywordCount?: number } = {}
): Promise<ImageMetadata> {
  const { titleLength = 70, keywordCount = 35 } = config;
  const base64Data = await fileToBase64(file);
  const rawBase64 = base64Data.split(',')[1];
  const mimeType = file.type;

  try {
    const response = await fetch("/api/gemini/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: rawBase64,
        mimeType,
        titleLength,
        keywordCount,
        customApiKey,
      }),
    });

    if (!response.ok) {
      let errData;
      try {
        errData = await response.json();
      } catch (e) {
        throw new Error(`API returned status ${response.status}`);
      }

      const errMsg = errData.error || `HTTP error ${response.status}`;
      const err: any = new Error(errMsg);
      err.type = errData.type; // quota_exceeded, invalid_key
      throw err;
    }

    const data = await response.json();
    return data as ImageMetadata;
  } catch (err: any) {
    if (err.type) {
      throw err; // Re-throw structured custom errors
    }
    const errorMessage = err.message || String(err);
    throw new Error(errorMessage);
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
