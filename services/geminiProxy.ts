/**
 * Gemini Proxy Client
 * Drop-in replacement for direct Gemini API calls
 * 
 * USAGE:
 * 1. Copy this file to your app's services folder
 * 2. Set VITE_PROXY_URL in your .env to your deployed proxy
 * 3. Replace GoogleGenAI calls with these functions
 */

// Set this to your deployed Cloud Run URL
const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:8080";

interface GenerateOptions {
  model?: string;
  systemInstruction?: string;
  maxTokens?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TTSOptions {
  voiceName?: string;
  model?: string;
}

/**
 * Generate text from a prompt
 */
export async function generate(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const response = await fetch(`${PROXY_URL}/v1/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      model: options.model || "gemini-2.0-flash",
      system_instruction: options.systemInstruction,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Chat completion
 */
export async function chat(
  messages: ChatMessage[],
  options: GenerateOptions = {}
): Promise<string> {
  const response = await fetch(`${PROXY_URL}/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      })),
      model: options.model || "gemini-2.0-flash",
      system_instruction: options.systemInstruction,
    }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Text-to-speech - returns base64 audio
 */
export async function textToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  const response = await fetch(`${PROXY_URL}/v1/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice_name: options.voiceName || "Kore",
      model: options.model || "gemini-2.5-flash-preview-tts",
    }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return data.audio; // base64 encoded audio
}

/**
 * Simple chat class for multi-turn conversations
 */
export class ProxyChat {
  private messages: ChatMessage[] = [];
  private systemInstruction?: string;
  private model: string;

  constructor(options: { systemInstruction?: string; model?: string } = {}) {
    this.systemInstruction = options.systemInstruction;
    this.model = options.model || "gemini-2.0-flash";
  }

  async sendMessage(message: string): Promise<string> {
    this.messages.push({ role: "user", content: message });

    const response = await chat(this.messages, {
      model: this.model,
      systemInstruction: this.systemInstruction,
    });

    this.messages.push({ role: "assistant", content: response });
    return response;
  }

  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  clearHistory(): void {
    this.messages = [];
  }
}
