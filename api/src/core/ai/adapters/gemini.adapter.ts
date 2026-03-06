import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider } from '../ai-provider.interface';

type GeminiCandidate = {
  content?: { parts?: Array<{ text?: string }> };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

@Injectable()
export class GeminiAdapter implements IAIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY', '');
    this.model = this.config.get<string>('GEMINI_MODEL', 'gemini-1.5-flash');
    this.baseUrl = this.config.get<string>(
      'GEMINI_BASE_URL',
      'https://generativelanguage.googleapis.com/v1beta',
    );
  }

  async summarize(text: string): Promise<string> {
    const prompt =
      `Summarize the document in 4-6 sentences. Keep it clean and readable.\n\n` +
      `DOCUMENT:\n${text}`;

    const raw = await this.callGemini(prompt);
    return this.cleanupMarkdown(raw).trim();
  }

  async generateTags(text: string): Promise<string[]> {
    const prompt =
      `Generate 5-10 short tags for this document.\n` +
      `Return ONLY JSON array of strings. Example: ["tag1","tag2"]\n\n` +
      `DOCUMENT:\n${text}`;

    const raw = await this.callGemini(prompt);
    const cleaned = this.cleanupMarkdown(raw);
    const json = this.extractJsonArray(cleaned);
    if (!json) return [];

    try {
      const parsed: unknown = JSON.parse(json);
      if (Array.isArray(parsed)) {
        return (parsed as unknown[])
          .filter((x): x is string => typeof x === 'string')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }

    const url =
      `${this.baseUrl}/models/${encodeURIComponent(this.model)}:generateContent` +
      `?key=${encodeURIComponent(this.apiKey)}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    return this.withRetry(async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const err = new Error('Rate limited') as Error & { code: number };
        err.code = 429;
        throw err;
      }

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Gemini error ${res.status}: ${t.slice(0, 400)}`);
      }

      const data = (await res.json()) as GeminiResponse;
      const textOut = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      return textOut;
    });
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const max = 3;
    for (let i = 0; i < max; i++) {
      try {
        return await fn();
      } catch (e: unknown) {
        const code = (e as Error & { code?: number })?.code;
        if (code === 429 && i < max - 1) {
          await this.sleep(400 * (i + 1));
          continue;
        }
        throw e;
      }
    }
    throw new Error('Retry failed');
  }

  private cleanupMarkdown(s: string): string {
    return s
      .replace(/^```[a-zA-Z]*\n?/g, '')
      .replace(/```$/g, '')
      .trim();
  }

  private extractJsonArray(s: string): string | null {
    const start = s.indexOf('[');
    const end = s.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) return null;
    return s.slice(start, end + 1).trim();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
