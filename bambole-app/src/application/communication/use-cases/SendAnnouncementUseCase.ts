import { IAnnouncementRepository } from '@/domain/communication/repositories/IAnnouncementRepository';
import { IUserRepository } from '@/domain/identity/repositories/IUserRepository';
import { IPushService } from '../services/IPushService';
import { Announcement } from '@/domain/communication/entities/Announcement';
import { AnnouncementContent, Audience, AudienceType } from '@/domain/communication/value-objects/CommunicationVOs';

export class SendAnnouncementUseCase {
    constructor(
        private readonly announceRepo: IAnnouncementRepository,
        private readonly userRepo: IUserRepository,
        private readonly pushService: IPushService
    ) { }

    async execute(
        authorId: string,
        content: string,
        audienceType: AudienceType,
        classId?: string
    ): Promise<void> {
        const annContent = AnnouncementContent.create(content);
        const audience = audienceType === 'class' ? Audience.forClass(classId!) : Audience.forAll();

        const announcement = new Announcement(undefined, authorId, annContent, audience, new Date());
        await this.announceRepo.save(announcement);

        let tokens: string[] = [];
        let title = 'Bambolê: ';

        if (audience.type === 'class') {
            if (!audience.classId) throw new Error('Class ID is required for class audience');
            tokens = await this.userRepo.findTokensByClass(audience.classId);
            title += 'Novo Aviso';
        } else {
            tokens = await this.userRepo.findAllParentTokens();
            title += 'Comunicado Geral';
        }

        if (tokens.length > 0) {
            await this.pushService.send(tokens, title, annContent.value);
        }
    }
}
