import { NextRequest } from "next/server";
import * as db from "@/lib/db";

const USER_ID = "default-user";

export async function GET(req: NextRequest) {
  const summary = db.getSummary(USER_ID);
  const messages = db.getRecentMessages(USER_ID, 10);

  return Response.json(
    { summary: summary?.currentSummary ?? null, messages },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    }
  );
}
