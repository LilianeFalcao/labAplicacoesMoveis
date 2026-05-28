import { RequestTemporaryAccessUseCase } from '../RequestTemporaryAccessUseCase';
import { IAccessRequestRepository } from '../../../../domain/activity/repositories/IAccessRequestRepository';
import { ClassAccessRequest, AccessRequestStatus } from '../../../../domain/activity/entities/ClassAccessRequest';
import { IUserRepository } from '../../../../domain/identity/repositories/IUserRepository';
import { IPushService } from '../../../communication/services/IPushService';

describe('RequestTemporaryAccessUseCase', () => {
    let useCase: RequestTemporaryAccessUseCase;
    let mockAccessRequestRepository: jest.Mocked<IAccessRequestRepository>;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockPushService: jest.Mocked<IPushService>;

    beforeEach(() => {
        mockAccessRequestRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findByMonitorId: jest.fn()
        } as any;

        mockUserRepository = {
            findAdminTokens: jest.fn(),
        } as any;

        mockPushService = {
            send: jest.fn(),
        } as any;

        useCase = new RequestTemporaryAccessUseCase(
            mockAccessRequestRepository,
            mockUserRepository,
            mockPushService
        );
    });

    it('should create and save a new access request and notify administrators', async () => {
        const monitorId = 'm1';
        const classId = 'c1';
        const adminTokens = ['adminToken1', 'adminToken2'];

        mockUserRepository.findAdminTokens.mockResolvedValue(adminTokens);

        await useCase.execute(monitorId, classId);

        expect(mockAccessRequestRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                monitorId: monitorId,
                classId: classId,
                status: AccessRequestStatus.PENDING
            })
        );

        expect(mockUserRepository.findAdminTokens).toHaveBeenCalledTimes(1);
        expect(mockPushService.send).toHaveBeenCalledTimes(1);
        expect(mockPushService.send).toHaveBeenCalledWith(
            adminTokens,
            'Nova Solicitação de Acesso',
            `O monitor ${monitorId} solicitou acesso temporário à turma ${classId}.`
        );
    });

    it('should not send push notifications if no administrators have push tokens', async () => {
        const monitorId = 'm1';
        const classId = 'c1';

        mockUserRepository.findAdminTokens.mockResolvedValue([]);

        await useCase.execute(monitorId, classId);

        expect(mockAccessRequestRepository.save).toHaveBeenCalled();
        expect(mockUserRepository.findAdminTokens).toHaveBeenCalledTimes(1);
        expect(mockPushService.send).not.toHaveBeenCalled();
    });
});
