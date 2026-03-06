import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER_TOKEN } from './ai.constants';
import { MockAIAdapter } from './adapters/mock-ai.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';

@Module({
  providers: [
    MockAIAdapter,
    GeminiAdapter,
    {
      provide: AI_PROVIDER_TOKEN,
      inject: [ConfigService, MockAIAdapter, GeminiAdapter],
      useFactory: (config: ConfigService, mock: MockAIAdapter, gemini: GeminiAdapter) => {
        const provider = config.get<string>('AI_PROVIDER', 'mock');
        return provider === 'gemini' ? gemini : mock;
      },
    },
  ],
  exports: [AI_PROVIDER_TOKEN],
})
export class AiModule {}
