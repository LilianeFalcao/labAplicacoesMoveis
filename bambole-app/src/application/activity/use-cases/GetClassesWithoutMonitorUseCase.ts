import { IClassRepository } from '../../../domain/activity/repositories/IClassRepository';
import { Class } from '../../../domain/activity/entities/Class';

export class GetClassesWithoutMonitorUseCase {
    constructor(private classRepository: IClassRepository) { }

    async execute(): Promise<Class[]> {
        return this.classRepository.findAllWithoutMonitor();
    }
}
