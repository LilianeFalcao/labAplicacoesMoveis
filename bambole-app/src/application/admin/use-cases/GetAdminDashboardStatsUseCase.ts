import { supabase } from '@/infrastructure/supabase/client';
import { AdminDashboardStats } from './AdminDashboardStats';

export class GetAdminDashboardStatsUseCase {
    async execute(): Promise<AdminDashboardStats> {
        const today = new Date().toISOString().split('T')[0];

        // 1. Total Students
        const { count: totalStudents } = await supabase
            .from('children')
            .select('*', { count: 'exact', head: true });

        // 2. Active Classes
        const { count: activeClasses } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true });

        // 3. Present Today
        const { count: presentToday } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('date', today)
            .eq('status', 'present');

        // 4. Pending Access Requests
        const { count: pendingAccessRequests } = await supabase
            .from('class_access_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        return {
            totalStudents: totalStudents || 0,
            presentToday: presentToday || 0,
            activeClasses: activeClasses || 0,
            pendingAccessRequests: pendingAccessRequests || 0
        };
    }
}
