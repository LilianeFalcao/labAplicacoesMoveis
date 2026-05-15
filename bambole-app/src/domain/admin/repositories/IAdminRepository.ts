import { AdminDashboardStats } from '../entities/AdminDashboardStats';

export interface IAdminRepository {
    getDashboardStats(): Promise<AdminDashboardStats>;
}
