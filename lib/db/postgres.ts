import { Pool } from "pg";
import type { Message, Summary } from "@/types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://asmashita:asmashita@localhost:5432/asmashita",
});

export async function getSummary(userId: string): Promise<Summary | null> {
  const { rows } = await pool.query(
    "SELECT current_summary, message_count, last_summarized_at FROM summaries WHERE user_id = $1",
    [userId]
  );
  if (!rows.length) return null;
  return {
    currentSummary: rows[0].current_summary,
    messageCount: rows[0].message_count,
    lastSummarizedAt: Number(rows[0].last_summarized_at),
  };
}

export async function saveSummary(userId: string, summary: Summary) {
  await pool.query(
    `INSERT INTO summaries (user_id, current_summary, message_count, last_summarized_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       current_summary = $2, message_count = $3, last_summarized_at = $4, updated_at = NOW()`,
    [userId, summary.currentSummary, summary.messageCount, summary.lastSummarizedAt]
  );
}

export async function addMessage(userId: string, msg: Message) {
  await pool.query(
    "INSERT INTO messages (user_id, role, content, timestamp) VALUES ($1, $2, $3, $4)",
    [userId, msg.role, msg.content, msg.timestamp]
  );
}

export async function getRecentMessages(userId: string, count: number): Promise<Message[]> {
  const { rows } = await pool.query(
    "SELECT id, role, content, timestamp FROM messages WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2",
    [userId, count]
  );
  return rows.reverse();
}

export async function getMessageCount(userId: string): Promise<number> {
  const { rows } = await pool.query(
    "SELECT COUNT(*) as count FROM messages WHERE user_id = $1",
    [userId]
  );
  return Number(rows[0].count);
}

export async function getOldestMessages(userId: string, count: number): Promise<Message[]> {
  const { rows } = await pool.query(
    "SELECT id, role, content, timestamp FROM messages WHERE user_id = $1 ORDER BY timestamp ASC LIMIT $2",
    [userId, count]
  );
  return rows;
}

export async function removeOldestMessages(userId: string, count: number) {
  await pool.query(
    "DELETE FROM messages WHERE user_id = $1 AND id IN (SELECT id FROM messages WHERE user_id = $1 ORDER BY timestamp ASC LIMIT $2)",
    [userId, count]
  );
}

export async function getMessages(userId: string): Promise<Message[]> {
  const { rows } = await pool.query(
    "SELECT id, role, content, timestamp FROM messages WHERE user_id = $1 ORDER BY timestamp ASC",
    [userId]
  );
  return rows;
}
