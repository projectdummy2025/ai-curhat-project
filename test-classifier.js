const { classifyImplicitRisk } = require("./lib/ai/guardrail");

async function test() {
  process.env.OPENROUTER_API_KEY = "sk-or-v1-xxxx";
  process.env.AI_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";

  console.log("Testing classifyImplicitRisk...");
  try {
    const start = Date.now();
    const res = await classifyImplicitRisk("saya sedih sekali hari ini");
    console.log(`Result in ${Date.now() - start}ms:`, res);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
