
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION, MODELS } from "../constants";
import { TrustLevel } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const simplifyMedicalText = async (input: string, imageBase64?: string) => {
  const ai = getAI();
  
  const parts: any[] = [{ text: `Simplify this medical information for a senior. User typed: ${input || "No text provided, please analyze the attached image."}` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          whatIsIt: { type: Type.STRING },
          howToUse: { type: Type.STRING },
          whyImportant: { type: Type.STRING },
        },
        required: ["whatIsIt", "howToUse", "whyImportant"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const checkMisinformation = async (claim: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: `Analyze this health claim for a senior: ${claim}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trustLevel: { type: Type.STRING, enum: Object.values(TrustLevel) },
          explanation: { type: Type.STRING },
          trickUsed: { type: Type.STRING },
        },
        required: ["trustLevel", "explanation", "trickUsed"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getMedicationGuide = async (medName: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: `Provide a simple medication guide for: ${medName}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          precautions: { type: Type.STRING },
          reminder: { type: Type.STRING },
        },
        required: ["name", "dosage", "precautions", "reminder"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const speakText = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || '';
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
