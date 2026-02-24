import { Global, Module } from '@nestjs/common';
import { JsonLoggerService } from './json-logger.service';

// @Global() → Bu module bir kez import edilince JsonLoggerService
// her module'den ek import gerekmeden inject edilebilir hale gelir.
// RedisModule gibi - her yerde ihtiyaç var, tekrar tekrar import etmek istemeyiz.
@Global()
@Module({
    providers: [JsonLoggerService],
    exports: [JsonLoggerService],
})
export class LoggingModule { }
