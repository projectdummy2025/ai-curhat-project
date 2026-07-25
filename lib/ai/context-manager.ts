import { generateText } from "ai";
import { getModel } from "./model";
import type { Message, Summary } from "@/types";
import * as db from "@/lib/db";

const WINDOW_SIZE = 10;
const SUMMARIZE_TRIGGER = 20;

const SYSTEM_PROMPT_BASE = `Kamu adalah asisten pendengar empatik. Tujuanmu adalah membantu pengguna mencurahkan isi hati secara aman dan tanpa penghakiman.
Validasi emosi mereka. Jangan memberikan diagnosis medis atau psikologis.
Jangan memberikan nasihat kecuali diminta. Fokus pada mendengarkan dan memvalidasi.`;

export function buildContextPrompt(userId: string): { systemPrompt: string; messages: { role: "user" | "assistant"; content: string }[] } {
  const summary = db.getSummary(userId);
  const recentMessages = db.getRecentMessages(userId, WINDOW_SIZE);

  const systemPrompt = summary?.currentSummary
    ? `${SYSTEM_PROMPT_BASE}\n\n[CONTEXT_SUMMARY]: ${summary.currentSummary}`
    : SYSTEM_PROMPT_BASE;

  const messages: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of recentMessages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  return { systemPrompt, messages };
}

export async function triggerSummarization(userId: string) {
  const messageCount = db.getMessageCount(userId);
  const summary = db.getSummary(userId);

  if (messageCount < SUMMARIZE_TRIGGER) return;
  if (summary && (messageCount - summary.messageCount) < SUMMARIZE_TRIGGER) return;

  const oldestMessages = db.getOldestMessages(userId, WINDOW_SIZE);

  try {
    const { text } = await generateText({
      model: getModel(),
      prompt: `Rangkum percakapan berikut menjadi 1 paragraf konteks emosional dan faktual.
JANGAN gunakan istilah diagnosis medis. Fokus pada perasaan dan situasi pengguna.
Gunakan bahasa Indonesia.

Percakapan:
${oldestMessages.map(m => `${m.role}: ${m.content}`).join("\n")}`,
    });

    db.saveSummary(userId, {
      currentSummary: text,
      messageCount,
      lastSummarizedAt: Date.now(),
    });

    db.removeOldestMessages(userId, WINDOW_SIZE);
  } catch {
    // Fail-safe: lanjutkan dengan sliding window saja, jangan blokir percakapan
  }
}
