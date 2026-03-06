import { Injectable } from '@nestjs/common';
import { IAIProvider } from '../ai-provider.interface';

@Injectable()
export class MockAIAdapter implements IAIProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  summarize(_text: string): Promise<string> {
    return Promise.resolve('Lorem Ipsum summary');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateTags(_text: string): Promise<string[]> {
    return Promise.resolve(['lorem', 'ipsum', 'mock']);
  }
}
