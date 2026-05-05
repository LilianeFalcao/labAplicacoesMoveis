import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';

export interface MonitorClass {
    id: string;
    name: string;
    timeLabel: string;
    ageGroup: string;
    isCallAllowedNow(): boolean;
}

export class GetMonitorClassesUseCase {
    constructor(
        private classRepository: IClassRepository,
        private accessRequestRepository: IAccessRequestRepository
    ) { }

    async execute(monitorId: string): Promise<MonitorClass[]> {
        // 1. Obter turmas diretamente atribuídas ao monitor
        const assignedClasses = await this.classRepository.findByMonitorId(monitorId);

        // 2. Obter turmas em que o acesso foi aprovado temporariamente
        const requests = await this.accessRequestRepository.findByMonitorId(monitorId);
        const approvedRequests = requests.filter(r => r.status === 'APPROVED');
        const approvedClassIds = approvedRequests.map(r => r.classId);
        const approvedClasses = await this.classRepository.findByIds(approvedClassIds);

        // 3. Unir e remover duplicatas
        const allClasses = [...assignedClasses, ...approvedClasses];
        const uniqueClassesMap = new Map();
        allClasses.forEach(cls => {
            uniqueClassesMap.set(cls.id, cls);
        });

        const uniqueClasses = Array.from(uniqueClassesMap.values());

        // 4. Mapear para o formato esperado
        return uniqueClasses.map(cls => ({
            id: cls.id,
            name: cls.name,
            timeLabel: `${cls.weeklySchedule.startTime} - ${cls.weeklySchedule.endTime}`,
            ageGroup: cls.ageRange || 'Livre',
            isCallAllowedNow: () => cls.isCallAllowedNow()
        }));
    }
}
