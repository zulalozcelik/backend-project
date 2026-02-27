import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        Reflector,
      ],
    })
      .overrideGuard(require('../auth/jwt/jwt.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../../common/guards/rate-limit.guard').RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call userService.findAll', async () => {
    mockUserService.findAll.mockResolvedValue([]);
    await controller.findAll('0', '10');
    expect(mockUserService.findAll).toHaveBeenCalledWith(0, 10);
  });

  it('findOne should call userService.findOne', async () => {
    mockUserService.findOne.mockResolvedValue(null);
    await controller.findOne('some-id');
    expect(mockUserService.findOne).toHaveBeenCalledWith('some-id');
  });

  it('remove should return deleted: true', async () => {
    mockUserService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('some-id');
    expect(result).toEqual({ data: { deleted: true } });
  });
});
