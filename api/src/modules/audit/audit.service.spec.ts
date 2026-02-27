import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditLog } from './audit-log.schema';

const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
};

describe('AuditService', () => {
    let service: AuditService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditService,
                { provide: getModelToken(AuditLog.name), useValue: mockModel },
            ],
        }).compile();

        service = module.get<AuditService>(AuditService);
        jest.clearAllMocks();
    });

    describe('createLog', () => {
        it('should call model.create with the input', async () => {
            mockModel.create.mockResolvedValue({});
            const input = {
                action: 'CREATE' as const,
                entity: 'users',
                entityId: 'abc-123',
                oldData: null,
                newData: { name: 'Test' },
                performedBy: 'user-sub',
                timestamp: new Date(),
            };
            await service.createLog(input);
            expect(mockModel.create).toHaveBeenCalledWith(input);
        });
    });

    describe('queryLogs', () => {
        it('should return items and total with no filters', async () => {
            const fakeItems = [{ id: '1', action: 'CREATE' }];
            const chainMock = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(fakeItems),
            };
            mockModel.find.mockReturnValue(chainMock);
            mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

            const result = await service.queryLogs({ limit: 10, offset: 0 });

            expect(result.items).toEqual(fakeItems);
            expect(result.total).toBe(1);
        });

        it('should apply entity and action filters', async () => {
            const chainMock = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            mockModel.find.mockReturnValue(chainMock);
            mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

            await service.queryLogs({ entity: 'users', action: 'UPDATE', limit: 5, offset: 0 });

            expect(mockModel.find).toHaveBeenCalledWith(
                expect.objectContaining({ entity: 'users', action: 'UPDATE' }),
            );
        });

        it('should apply date range filter', async () => {
            const chainMock = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            mockModel.find.mockReturnValue(chainMock);
            mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

            const from = new Date('2024-01-01');
            const to = new Date('2024-12-31');
            await service.queryLogs({ from, to, limit: 10, offset: 0 });

            expect(mockModel.find).toHaveBeenCalledWith(
                expect.objectContaining({ timestamp: { $gte: from, $lte: to } }),
            );
        });
    });
});
