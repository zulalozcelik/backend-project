import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { createTaskSchema } from './dto/create-task.dto';
import type { CreateTaskDto } from './dto/create-task.dto';
import { updateTaskSchema } from './dto/update-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @Roles('USER', 'ADMIN')
  async create(@Body() body: CreateTaskDto) {
    const dto = createTaskSchema.parse(body);
    const data = await this.service.create(dto.title, dto.description);
    return { data, meta: { isCached: false } };
  }

  @Get()
  @Roles('USER', 'ADMIN')
  async findAll() {
    const data = await this.service.findAll();
    return { data, meta: { isCached: false } };
  }

  @Get(':id')
  @Roles('USER', 'ADMIN')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { data, meta: { isCached: false } };
  }

  @Patch(':id')
  @Roles('USER', 'ADMIN')
  async update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    const dto = updateTaskSchema.parse(body);
    const data = await this.service.update(id, dto);
    return { data, meta: { isCached: false } };
  }

  @Delete(':id')
  @Roles('USER', 'ADMIN')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { data, meta: { isCached: false } };
  }
}
