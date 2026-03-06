export interface IAIProvider {
  summarize(text: string): Promise<string>;
  generateTags(text: string): Promise<string[]>;
}
