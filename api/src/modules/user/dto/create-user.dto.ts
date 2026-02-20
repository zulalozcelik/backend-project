import { createZodDto } from 'nestjs-zod';
import { userInsertSchema } from './user.zod.js';

export class CreateUserDto extends createZodDto(userInsertSchema) { }
