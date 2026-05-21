import { IClassRepository, MonitorClassAssignment } from '../../../domain/activity/repositories/IClassRepository';

export class AssignClassesToMonitorUseCase {
    constructor(private classRepository: IClassRepository) {}

    async execute(monitorId: string, assignments: MonitorClassAssignment[]): Promise<void> {
        if (!monitorId) {
            throw new Error('Monitor ID is required');
        }

        const primaryAssignments = assignments.filter(a => a.isPrimary);
        if (primaryAssignments.length > 1) {
            throw new Error('Only one class can be marked as primary');
        }

        await this.classRepository.assignClassesToMonitor(monitorId, assignments);
    }
}
