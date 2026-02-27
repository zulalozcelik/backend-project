import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EventBusService } from '../../common/events/event-bus.service';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findByEmail: jest.fn(),
  findAuthByEmail: jest.fn(),
  withTransaction: jest.fn((fn: () => Promise<unknown>) => fn()),
};

const mockEventBus = { emit: jest.fn(), on: jest.fn() };

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'USER_REPOSITORY', useValue: mockRepo },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should delegate to repository', async () => {
    mockRepo.findAll.mockResolvedValue([]);
    await service.findAll(0, 10);
    expect(mockRepo.findAll).toHaveBeenCalledWith({ skip: 0, limit: 10 });
  });

  it('findOne should delegate to repository', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await service.findOne('some-id');
    expect(mockRepo.findById).toHaveBeenCalledWith('some-id');
  });

  it('findOneForAudit should return the user object', async () => {
    const user = { id: 'u1', name: 'Test' };
    mockRepo.findById.mockResolvedValue(user);
    const result = await service.findOneForAudit('u1');
    expect(result).toEqual(user);
  });

  it('update should emit UserUpdatedEvent on success', async () => {
    const old = { id: 'u1', name: 'Old' };
    const updated = { id: 'u1', name: 'New' };
    mockRepo.findById.mockResolvedValue(old);
    mockRepo.update.mockResolvedValue(updated);
    await service.update('u1', { name: 'New' }, 'admin-id');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'user.updated',
      expect.objectContaining({ entityId: 'u1', performedBy: 'admin-id' }),
    );
  });

  it('remove should call softDelete', async () => {
    mockRepo.softDelete.mockResolvedValue(undefined);
    await service.remove('u1');
    expect(mockRepo.softDelete).toHaveBeenCalledWith('u1');
  });
});
