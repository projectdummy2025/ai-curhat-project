import type { Message, Summary } from "@/types";

// Escape Hatch: In-memory Map (data hilang saat server restart, cukup untuk demo)
const store = new Map<string, { summary: Summary | null; messages: Message[] }>();

function getStore(userId: string) {
  if (!store.has(userId)) {
    store.set(userId, { summary: null, messages: [] });
  }
  return store.get(userId)!;
}

export function getSummary(userId: string): Summary | null {
  return getStore(userId).summary;
}

export function saveSummary(userId: string, summary: Summary) {
  getStore(userId).summary = summary;
}

export function getMessages(userId: string): Message[] {
  return getStore(userId).messages;
}

export function addMessage(userId: string, message: Message) {
  getStore(userId).messages.push(message);
}

export function getRecentMessages(userId: string, count: number): Message[] {
  const messages = getStore(userId).messages;
  return messages.slice(-count);
}

export function getMessageCount(userId: string): number {
  return getStore(userId).messages.length;
}

export function getOldestMessages(userId: string, count: number): Message[] {
  return getStore(userId).messages.slice(0, count);
}

export function removeOldestMessages(userId: string, count: number) {
  const data = getStore(userId);
  data.messages = data.messages.slice(count);
}
