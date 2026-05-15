import { GetAdminDashboardStatsUseCase } from '../GetAdminDashboardStatsUseCase';
import { IAdminRepository } from '@/domain/admin/repositories/IAdminRepository';
import { AdminDashboardStats } from '@/domain/admin/entities/AdminDashboardStats';

describe('GetAdminDashboardStatsUseCase', () => {
    let useCase: GetAdminDashboardStatsUseCase;
    let mockRepo: jest.Mocked<IAdminRepository>;

    beforeEach(() => {
        mockRepo = {
            getDashboardStats: jest.fn()
        };
        useCase = new GetAdminDashboardStatsUseCase(mockRepo);
    });

    it('should return stats from the repository', async () => {
        const expectedStats: AdminDashboardStats = {
            totalStudents: 100,
            presentToday: 85,
            activeClasses: 10,
            pendingAccessRequests: 2
        };

        mockRepo.getDashboardStats.mockResolvedValue(expectedStats);

        const result = await useCase.execute();

        expect(result).toEqual(expectedStats);
        expect(mockRepo.getDashboardStats).toHaveBeenCalledTimes(1);
    });

    it('should throw error if repository fails', async () => {
        mockRepo.getDashboardStats.mockRejectedValue(new Error('DB Error'));

        await expect(useCase.execute()).rejects.toThrow('DB Error');
    });
});
