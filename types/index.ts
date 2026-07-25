export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Summary {
  currentSummary: string;
  messageCount: number;
  lastSummarizedAt: number;
}

export interface GuardrailResponse {
  isSafe: boolean;
  confidence: number;
  reason: string;
}

export interface ChatState {
  summary: Summary | null;
  recentMessages: Message[];
}
