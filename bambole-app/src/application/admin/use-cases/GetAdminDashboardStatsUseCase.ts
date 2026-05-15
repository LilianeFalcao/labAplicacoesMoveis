import { IAdminRepository } from '@/domain/admin/repositories/IAdminRepository';
import { AdminDashboardStats } from '@/domain/admin/entities/AdminDashboardStats';

export class GetAdminDashboardStatsUseCase {
    constructor(private adminRepo: IAdminRepository) {}

    async execute(): Promise<AdminDashboardStats> {
        return this.adminRepo.getDashboardStats();
    }
}
