import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.getOrThrow<string>('MONGO_URI'),
                family: 4,
                serverSelectionTimeoutMS: 10000,
            }),
        }),
    ],
    exports: [MongooseModule],
})
export class MongoModule { }
