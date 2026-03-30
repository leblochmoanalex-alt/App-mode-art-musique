import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ArtisticMatch {
  style: string;
  description: string;
  imageSeed: string;
  pricingFactors: {
    rarity: number;
    notoriety: number;
    dataVolume: number;
    carbon: number;
  };
}

export async function getArtisticMatches(query: string): Promise<ArtisticMatch[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following query (musical genre or fashion brand) and find 3 distinct artistic counterparts. 
    Query: "${query}"
    
    For each match, provide:
    1. A short, punchy name for the artistic style (e.g., "Cyber-Baroque", "Minimalist Techno-Chic").
    2. A brief description (2 sentences max) explaining the connection.
    3. A single keyword for image generation (e.g., "neon", "minimalist", "brutalist").
    4. Pricing factors (0-100 scale) based on the "cote" (market value/standing) of this specific artistic style or brand:
       - rarity: How rare/exclusive is this style?
       - notoriety: How famous/recognized is this style/brand?
       - dataVolume: How much digital data/history exists for this?
       - carbon: Estimated digital footprint (higher for complex/data-heavy styles).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            description: { type: Type.STRING },
            imageSeed: { type: Type.STRING },
            pricingFactors: {
              type: Type.OBJECT,
              properties: {
                rarity: { type: Type.NUMBER },
                notoriety: { type: Type.NUMBER },
                dataVolume: { type: Type.NUMBER },
                carbon: { type: Type.NUMBER }
              },
              required: ["rarity", "notoriety", "dataVolume", "carbon"]
            }
          },
          required: ["style", "description", "imageSeed", "pricingFactors"]
        }
      }
    }
  });

  const result = JSON.parse(response.text);
  return result as ArtisticMatch[];
}
