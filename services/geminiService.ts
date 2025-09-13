
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { GeminiResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        patientInfo: {
            type: Type.OBJECT,
            properties: {
                nombre: { type: Type.STRING, description: "Nombre completo del paciente." },
                id: { type: Type.STRING, description: "ID o número de identificación del paciente." },
                fechaNacimiento: { type: Type.STRING, description: "Fecha de nacimiento del paciente en formato DD/MM/YYYY." },
            },
        },
        reportDate: {
            type: Type.STRING,
            description: "La fecha en que se emitió el reporte, en formato DD/MM/YYYY."
        },
        results: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    seccion: { type: Type.STRING, description: "La sección del reporte a la que pertenece el examen (ej. HEMOGRAMA, BIOQUIMICA)." },
                    examen: { type: Type.STRING, description: "El nombre del examen realizado." },
                    resultado: { type: Type.STRING, description: "El valor o resultado del examen." },
                    unidades: { type: Type.STRING, description: "Las unidades del resultado (ej. mg/dL, %, /uL)." },
                    rangoReferencia: { type: Type.STRING, description: "El rango de referencia normal para el examen." },
                },
            },
        },
    },
};


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzePdf = async (file: File): Promise<GeminiResponse> => {
    const imagePart = await fileToGenerativePart(file);
    const textPart = {
        text: `Extract the lab report data from the provided file into the provided JSON schema. Pay close attention to the section headers (e.g., 'HEMOGRAMA #NUEVO', 'BIOQUIMICA', 'SEDIMENTO URINARIO'). Do not confuse tests with similar names from different sections; for example, 'Leucocitos' from 'HEMOGRAMA' is different from 'Leucocitos' in 'SEDIMENTO URINARIO'.`
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("La respuesta de la IA está vacía. El PDF podría no ser legible o tener un formato no esperado.");
        }
        
        return JSON.parse(jsonText) as GeminiResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("La IA devolvió un formato inválido. Por favor, intente con otro reporte.");
        }
        throw new Error("No se pudo procesar el reporte. Verifique la calidad del archivo PDF.");
    }
};
