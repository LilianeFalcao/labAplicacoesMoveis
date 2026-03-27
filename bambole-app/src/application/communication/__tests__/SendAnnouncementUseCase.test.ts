import { SendAnnouncementUseCase } from '@/application/communication/use-cases/SendAnnouncementUseCase';
import { IAnnouncementRepository } from '@/domain/communication/repositories/IAnnouncementRepository';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IPushService } from '@/application/communication/services/IPushService';
import { Announcement } from '@/domain/communication/entities/Announcement';
import { AnnouncementContent, Audience } from '@/domain/communication/value-objects/CommunicationVOs';

describe('SendAnnouncementUseCase', () => {
    let mockAnnounceRepo: jest.Mocked<IAnnouncementRepository>;
    let mockUserRepo: jest.Mocked<IUserRepository>;
    let mockPushService: jest.Mocked<IPushService>;
    let useCase: SendAnnouncementUseCase;

    beforeEach(() => {
        mockAnnounceRepo = {
            save: jest.fn(),
            findById: jest.fn(),
            findByClass: jest.fn(),
            findAll: jest.fn(),
        } as any;

        mockUserRepo = {
            findTokensByClass: jest.fn(),
            findAllParentTokens: jest.fn(),
        } as any;

        mockPushService = {
            send: jest.fn(),
        } as any;

        useCase = new SendAnnouncementUseCase(mockAnnounceRepo, mockUserRepo, mockPushService);
    });

    it('should send announcement to a specific class and trigger push', async () => {
        const classId = 'cl1';
        const tokens = ['token1', 'token2'];
        mockUserRepo.findTokensByClass.mockResolvedValue(tokens);

        await useCase.execute('u1', 'Reunião', 'class', classId);

        expect(mockAnnounceRepo.save).toHaveBeenCalled();
        expect(mockPushService.send).toHaveBeenCalledWith(tokens, 'Bambolê: Novo Aviso', 'Reunião');
    });

    it('should send announcement to all parents and trigger push', async () => {
        const tokens = ['tokenA', 'tokenB'];
        mockUserRepo.findAllParentTokens.mockResolvedValue(tokens);

        await useCase.execute('u1', 'Feriado', 'all');

        expect(mockAnnounceRepo.save).toHaveBeenCalled();
        expect(mockPushService.send).toHaveBeenCalledWith(tokens, 'Bambolê: Comunicado Geral', 'Feriado');
    });
});
