import { createZodDto } from 'nestjs-zod';
import { userUpdateSchema } from './user.zod.js';

export class UpdateUserDto extends createZodDto(userUpdateSchema) { }
