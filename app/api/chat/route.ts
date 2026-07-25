import { streamText } from "ai";
import { NextRequest } from "next/server";
import { getModel } from "@/lib/ai/model";
import { buildContextPrompt, triggerSummarization } from "@/lib/ai/context-manager";
import { checkExplicitKeywords, classifyImplicitRisk, getCrisisResponse } from "@/lib/ai/guardrail";
import * as db from "@/lib/db";

const USER_ID = "default-user"; // MVP: single user

export async function POST(req: NextRequest) {
  const json = await req.json();
  const messagesFromClient = json.messages || [];
  const latestMessageObj = messagesFromClient[messagesFromClient.length - 1];
  const message = latestMessageObj ? latestMessageObj.content : "";

  const stream = new ReadableStream({
    async start(controller) {
      const pushLog = (msg: string) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "log", message: msg }) + "\n"));
      };

      const pushText = (chunk: string) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "text", chunk }) + "\n"));
      };

      const pushCrisis = (msg: string) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "crisis_intervention", message: msg }) + "\n"));
      };

      try {
        pushLog("Memeriksa Lapis 1 (Regex)...");
        if (checkExplicitKeywords(message)) {
          pushCrisis(getCrisisResponse());
          controller.close();
          return;
        }

        pushLog("Memeriksa Lapis 2 (LLM Classifier)...");
        try {
          const classification = await classifyImplicitRisk(message);
          if (!classification.isSafe) {
            pushCrisis(getCrisisResponse());
            controller.close();
            return;
          }
        } catch {
          pushLog("Gagal Lapis 2 (Fail-safe). Lanjut...");
        }

        pushLog("Guardrail Aman. Memulai AI Stream...");

        if (message) {
          db.addMessage(USER_ID, {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            timestamp: Date.now(),
          });
        }

        await triggerSummarization(USER_ID);
        const { systemPrompt, messages } = buildContextPrompt(USER_ID);

        const result = streamText({
          model: getModel(),
          system: systemPrompt,
          messages: messages,
          onFinish: async ({ text }) => {
            db.addMessage(USER_ID, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: text.replace(/<think>[\s\S]*?<\/think>/g, "").trim(),
              timestamp: Date.now(),
            });
          },
        });

        for await (const chunk of result.textStream) {
          pushText(chunk);
        }
      } catch (err) {
        pushText("\n\n[Error] Gagal memproses permintaan.");
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" }
  });
}
