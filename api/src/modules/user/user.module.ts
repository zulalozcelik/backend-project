import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventsModule } from '../../common/events/events.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'USER_REPOSITORY',
      useClass: UserRepository,
    },
  ],
  exports: [UserService, 'USER_REPOSITORY'],
})
export class UserModule { }
