import { GoogleGenAI, Type } from "@google/genai";
import { MusicGenre, Mood, Brand, MusicAnalysis, ArtMatch } from "../types";
import mapping from "../data/mapping.json";

let ai: any = null;

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

export const isGeminiEnabled = !!process.env.GEMINI_API_KEY;

// --- Music Curator Agent ---
export async function musicCuratorAgent(artists: string[], genres: MusicGenre[], mood: Mood): Promise<MusicAnalysis> {
  if (!isGeminiEnabled) {
    return {
      genre: genres[0] || "Unknown",
      mood: mood,
      energy: "Medium",
      tags: ["Simulated", mood, ...genres]
    };
  }

  const client = getAI();
  const prompt = `Analyze the following music tastes:
    Artists: ${artists.join(", ")}
    Genres: ${genres.join(", ")}
    Mood: ${mood}
    
    Extract the core genre, mood, energy level, and 5 descriptive tags.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genre: { type: Type.STRING },
            mood: { type: Type.STRING },
            energy: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["genre", "mood", "energy", "tags"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Music Curator Agent Error:", error);
    return { genre: genres[0], mood, energy: "Medium", tags: genres };
  }
}

// --- Art Matcher Agent ---
const ART_GALLERY = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515405299443-fbd3bb755fbd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
];

export async function artMatcherAgent(analysis: MusicAnalysis, brand: Brand): Promise<ArtMatch> {
  const genreData = mapping.genres.find(g => g.name === analysis.genre) || 
                    mapping.genres.find(g => g.name === 'Ambient'); // Fallback
  const brandData = mapping.brands.find(b => b.name === brand) || 
                    mapping.brands.find(b => b.name === 'Balenciaga'); // Fallback

  if (!isGeminiEnabled) {
    // Select an image from the gallery based on the genre index to ensure variety even in simulation
    const genreIndex = mapping.genres.findIndex(g => g.name === analysis.genre);
    const galleryIndex = genreIndex >= 0 ? genreIndex % ART_GALLERY.length : 0;
    
    return {
      title: "Simulated Masterpiece",
      artist: "AI Muse",
      style: genreData?.style || "Abstract Expressionism",
      imageUrl: ART_GALLERY[galleryIndex],
      explanation: `${genreData?.description} This piece matches your ${analysis.mood} mood and ${analysis.genre} taste, influenced by ${brand}.`,
      colors: ["#000000", "#FFFFFF"]
    };
  }

  const client = getAI();
  const genrePrompt = genreData?.gemini_prompt || "Minimalist artwork, black and white, high contrast";
  const brandPrompt = brandData?.gemini_prompt || "Luxury aesthetic, black and white, editorial style";

  const prompt = `Based on this music analysis:
    Genre: ${analysis.genre}
    Mood: ${analysis.mood}
    Energy: ${analysis.energy}
    Tags: ${analysis.tags.join(", ")}
    Brand Influence: ${brand}
    
    Artistic Direction (Genre): ${genrePrompt}
    Artistic Direction (Brand): ${brandPrompt}
    
    Select the best matching art style and describe a unique piece of art that fuses these worlds.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            style: { type: Type.STRING },
            explanation: { type: Type.STRING },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "artist", "style", "explanation", "colors"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    
    let imageUrl = ART_GALLERY[Math.floor(Math.random() * ART_GALLERY.length)];
    try {
      const visualPrompt = `A high-end, black and white artistic image. Title: "${data.title}". Style: ${data.style}. Fusing ${genrePrompt} with ${brandPrompt}. Minimalist, editorial, high contrast.`;
      
      const imgResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: visualPrompt }] },
      });
      
      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgError) {
      console.warn("Image generation failed, using gallery fallback", imgError);
    }

    return { ...data, imageUrl };
  } catch (error) {
    console.error("Art Matcher Agent Error:", error);
    return {
      title: "Fallback Art",
      artist: "Gemini",
      style: "Modern",
      imageUrl: ART_GALLERY[Math.floor(Math.random() * ART_GALLERY.length)],
      explanation: "A matching piece for your unique taste.",
      colors: ["#333333"]
    };
  }
}

// --- Taste Explainer Agent ---
export async function tasteExplainerAgent(analysis: MusicAnalysis, art: ArtMatch, brand: Brand): Promise<string> {
  const genreData = mapping.genres.find(g => g.name === analysis.genre);
  const brandData = mapping.brands.find(b => b.name === brand);

  if (!isGeminiEnabled) {
    return `${genreData?.description || ''} ${brandData?.description || ''} Your love for ${analysis.genre} and ${brand}'s aesthetic perfectly aligns with the ${art.style} of this piece. It captures your ${analysis.mood} energy.`;
  }

  const client = getAI();
  const prompt = `Explain the connection between:
    Music: ${analysis.genre} (${analysis.mood}) - Context: ${genreData?.description || ''}
    Art: ${art.title} (${art.style})
    Brand: ${brand} - Context: ${brandData?.description || ''}
    
    Write a short, aesthetic explanation (2-3 lines) in a natural, sophisticated tone.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "A perfect harmony of sound, vision, and brand identity.";
  } catch (error) {
    console.error("Taste Explainer Agent Error:", error);
    return "A perfect harmony of sound, vision, and brand identity.";
  }
}
