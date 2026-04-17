import { RequestTemporaryAccessUseCase } from '../RequestTemporaryAccessUseCase';
import { IAccessRequestRepository } from '../../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest, AccessRequestStatus } from '../../../../domain/activity/entities/ClassAccessRequest';

describe('RequestTemporaryAccessUseCase', () => {
    let useCase: RequestTemporaryAccessUseCase;
    let mockAccessRequestRepository: jest.Mocked<IAccessRequestRepository>;

    beforeEach(() => {
        mockAccessRequestRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findByMonitorId: jest.fn()
        };
        useCase = new RequestTemporaryAccessUseCase(mockAccessRequestRepository);
    });

    it('should create and save a new access request', async () => {
        const monitorId = 'm1';
        const classId = 'c1';

        await useCase.execute(monitorId, classId);

        expect(mockAccessRequestRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                monitorId: monitorId,
                classId: classId,
                status: AccessRequestStatus.PENDING
            })
        );
    });
});
