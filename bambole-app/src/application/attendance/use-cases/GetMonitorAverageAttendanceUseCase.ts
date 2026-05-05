import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { IAccessRequestRepository } from '../../../domain/activity/repositories/IAccessRequestRepository';
import { IAttendanceRepository } from '../../../domain/attendance/repositories/IAttendanceRepository';
import { GetMonitorClassesUseCase } from '../../activity/use-cases/GetMonitorClassesUseCase';

export class GetMonitorAverageAttendanceUseCase {
    private getClassesUseCase: GetMonitorClassesUseCase;

    constructor(
        private classRepository: IClassRepository,
        private accessRequestRepository: IAccessRequestRepository,
        private attendanceRepository: IAttendanceRepository
    ) {
        this.getClassesUseCase = new GetMonitorClassesUseCase(classRepository, accessRequestRepository);
    }

    async execute(monitorId: string): Promise<string> {
        // 1. Obter todas as turmas ativas do monitor (incluindo acessos temporários aprovados)
        const classes = await this.getClassesUseCase.execute(monitorId);

        if (classes.length === 0) {
            return 'N/A';
        }

        // 2. Coletar todas as chamadas dessas turmas
        let totalRecords = 0;
        let positiveRecords = 0; // presenças ou faltas justificadas

        for (const cls of classes) {
            const records = await this.attendanceRepository.findByClassId(cls.id);
            totalRecords += records.length;

            positiveRecords += records.filter(r => 
                r.status.value === 'present' || r.status.value === 'justified'
            ).length;
        }

        if (totalRecords === 0) {
            return '0%';
        }

        // 3. Calcular a porcentagem
        const percentage = Math.round((positiveRecords / totalRecords) * 100);
        return `${percentage}%`;
    }
}
