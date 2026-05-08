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
        classIds?: string[]
    ): Promise<void> {
        const annContent = AnnouncementContent.create(content);

        if (audienceType === 'class' && classIds && classIds.length > 0) {
            for (const classId of classIds) {
                const audience = Audience.forClass(classId);
                const announcement = new Announcement(undefined, authorId, annContent, audience, new Date());
                await this.announceRepo.save(announcement);

                const tokens = await this.userRepo.findTokensByClass(classId);
                if (tokens.length > 0) {
                    await this.pushService.send(tokens, 'Bambolê: Novo Aviso', annContent.value);
                }
            }
        } else if (audienceType === 'all') {
            const audience = Audience.forAll();
            const announcement = new Announcement(undefined, authorId, annContent, audience, new Date());
            await this.announceRepo.save(announcement);

            const tokens = await this.userRepo.findAllParentTokens();
            if (tokens.length > 0) {
                await this.pushService.send(tokens, 'Bambolê: Comunicado Geral', annContent.value);
            }
        }
    }
}
