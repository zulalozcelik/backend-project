import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDrizzleClient } from './drizzle.client';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return createDrizzleClient(configService);
      },
    },
  ],
  exports: ['DRIZZLE'],
})
export class DatabaseModule {}
