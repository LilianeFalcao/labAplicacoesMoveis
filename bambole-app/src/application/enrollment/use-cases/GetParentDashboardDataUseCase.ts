import { IChildRepository } from '@/domain/enrollment/repositories/IChildRepository';
import { IGuardianRepository } from '@/domain/enrollment/repositories/IGuardianRepository';
import { IAttendanceRepository } from '@/domain/attendance/repositories/IAttendanceRepository';
import { IAnnouncementRepository } from '@/domain/communication/repositories/IAnnouncementRepository';
import { ParentDashboardData } from './ParentDashboardData';

export class GetParentDashboardDataUseCase {
    constructor(
        private readonly childRepo: IChildRepository,
        private readonly guardianRepo: IGuardianRepository,
        private readonly attendanceRepo: IAttendanceRepository,
        private readonly announcementRepo: IAnnouncementRepository
    ) {}

    async execute(userId: string): Promise<ParentDashboardData> {
        // 1. Get the Guardian associated with the User
        const guardian = await this.guardianRepo.findByUserId(userId);
        if (!guardian) {
            return { children: [], announcements: [] };
        }

        // 2. Get Children for this Guardian
        const children = await this.childRepo.findByGuardianId(guardian.id);
        
        const today = new Date().toISOString().split('T')[0];

        // 3. Enrich children with today's attendance status
        const enrichedChildren = await Promise.all(children.map(async (child) => {
            const attendance = await this.attendanceRepo.findByChildAndDate(child.id, today);
            
            return {
                id: child.id,
                name: child.name.value,
                classId: child.classId || '',
                photoUrl: child.photoUrl,
                status: (attendance?.status.value || 'pending') as any,
                label: this.getStatusLabel(attendance?.status.value)
            };
        }));

        // 4. Get relevant announcements for the children's classes
        const classIds = children.map(c => c.classId).filter((id): id is string => !!id);
        const announcements = await this.announcementRepo.findRelevantForClasses(classIds);

        return {
            children: enrichedChildren,
            announcements: announcements.map(ann => ({
                id: ann.id,
                title: ann.content.value,
                type: ann.audience.type === 'all' ? 'alert' : 'info',
                date: this.formatDate(ann.publishedAt),
                icon: ann.audience.type === 'all' ? 'bullhorn-variant' : 'calendar-text'
            }))
        };
    }

    private getStatusLabel(status: string | undefined): string {
        switch (status) {
            case 'present': return 'Presente';
            case 'absent': return 'Faltou';
            case 'pre_justified': return 'Falta Prevista';
            case 'justified': return 'Justificada';
            default: return 'Sem chamada';
        }
    }

    private formatDate(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'HOJE';
        if (days === 1) return 'ONTEM';
        return `${days} dias atrás`;
    }
}
