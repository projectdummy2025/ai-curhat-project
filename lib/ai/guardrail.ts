import { generateObject } from "ai";
import { z } from "zod";
import { getClassifierModel } from "./model";
import type { GuardrailResponse } from "@/types";

// Lapis 1: Regex keyword detection
const EXPLICIT_KEYWORDS = [
  "bunuh diri", "ingin mati", "akhiri hidup", "tidak kuat hidup",
  "cara mati", "loncat dari gedung", "minum racun", "gantung diri",
  "potong nadi", "mengakhiri semuanya", "lebih baik mati",
  "tidak ingin hidup lagi", "bunuh aku", "matikan aku",
];

export function checkExplicitKeywords(userInput: string): boolean {
  const lower = userInput.toLowerCase();
  return EXPLICIT_KEYWORDS.some(keyword => lower.includes(keyword));
}

// Lapis 2: LLM classifier (structured output)
export async function classifyImplicitRisk(userInput: string): Promise<GuardrailResponse> {
  const { object } = await generateObject({
    model: getClassifierModel(),
    schema: z.object({
      isSafe: z.boolean(),
      confidence: z.number(),
      reason: z.string(),
    }),
    prompt: `Anda adalah modul klasifikasi keamanan. Tugas Anda MURNI menganalisis apakah pesan pengguna mengandung indikasi krisis, self-harm, atau ideasi bunuh diri (baik eksplisit maupun implisit).
JANGAN memberikan respons terapeutik.
Evaluasi pesan berikut dan kembalikan HANYA dalam format JSON.

Pesan pengguna: "${userInput}"`,
  });

  return object;
}

// Lapis 3: Hardcoded crisis response
export function getCrisisResponse(): string {
  return `Kami mendengar kamu sedang sangat berat, dan keamananmu adalah prioritas utama saat ini. Chatbot ini tidak dilengkapi untuk menangani krisis. Tolong jangan bertindak apapun sekarang, dan segera hubungi layanan profesional yang bisa membantumu:

📞 119 (ext. 8) - Layanan Darurat
📞 021-7256526 / 0811-8450-245 - Into The Light Indonesia
📞 112 - Call Center Emergency`;
}
