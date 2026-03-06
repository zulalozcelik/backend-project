import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { RedisService } from '../../core/redis/redis.service';
import { JsonLoggerService } from '../../common/logging/json-logger.service';

type DrizzleDb = ReturnType<
  typeof import('../../core/database/drizzle.client').createDrizzleClient
>;

@Injectable()
export class HealthScheduler {
  constructor(
    @Inject('DRIZZLE') private readonly db: DrizzleDb,
    private readonly redis: RedisService,
    private readonly logger: JsonLoggerService,
  ) {}

  @Cron('0 */5 * * * *')
  async run() {
    const startedAt = Date.now();

    let dbOk = false;
    let redisOk = false;

    try {
      await this.db.execute('select 1');
      dbOk = true;
    } catch {
      // db unreachable
    }

    try {
      const pong = await this.redis
        .get('__healthcheck__ping__')
        .then(() => 'PONG')
        .catch(() => null);
      redisOk = pong === 'PONG';
    } catch {
      // redis unreachable
    }

    this.logger.log(
      JSON.stringify({
        msg: 'healthcheck.cron',
        dbOk,
        redisOk,
        durationMs: Date.now() - startedAt,
      }),
      HealthScheduler.name,
    );
  }
}
