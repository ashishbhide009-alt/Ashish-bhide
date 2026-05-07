/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GardenPreferences {
  climate: string;
  style: string;
  size: string;
  features: string[];
  referenceImage?: string; // base64 string
}

export interface PlantInfo {
  name: string;
  scientificName: string;
  role: string;
  careLevel: "Low" | "Medium" | "High";
}

export interface GardenDesign {
  title: string;
  description: string;
  layoutDescription: string;
  recommendedPlants: PlantInfo[];
  maintenanceTips: string[];
  visualPrompt: string; // Prompt for a hyper-realistic visualization
}

export async function generateGardenDesign(prefs: GardenPreferences): Promise<GardenDesign> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  let prompt: any[] = [
    `Create a detailed, hyper-realistic garden design for someone with these preferences:
    - Climate: ${prefs.climate}
    - Style: ${prefs.style}
    - Garden Size: ${prefs.size}
    - Desired Features: ${prefs.features.join(", ")}

    Return the response as a JSON object with this structure:
    {
      "title": "Short poetic title for the garden",
      "description": "General overview focusing on the atmospheric realism (lighting, textures, mood)",
      "layoutDescription": "Detailed advice on how to arrange the space precisely, referencing terrain and architectural context",
      "recommendedPlants": [
        { "name": "Common name", "scientificName": "Latin name", "role": "e.g. Focal point, ground cover", "careLevel": "Low/Medium/High" }
      ],
      "maintenanceTips": ["tip 1", "tip 2"],
      "visualPrompt": "A highly detailed description for a hyper-realistic architectural landscape visualization, including lens type, time of day, and specific material textures (e.g., 'dappled afternoon light through weathered cedar beams')"
    }`
  ];

  if (prefs.referenceImage) {
    const [mimeType, base64Data] = prefs.referenceImage.split(';base64,');
    const actualMime = mimeType.split(':')[1];
    prompt.push({
      inlineData: {
        data: base64Data,
        mimeType: actualMime
      }
    });
    prompt[0] += "\n\nCRITICAL: Analyze the attached image of the user's current space. Your layoutDescription must specifically reference elements in the photo (e.g., fence placement, existing trees, building proximity) and suggest how to transform this specific area.";
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}
