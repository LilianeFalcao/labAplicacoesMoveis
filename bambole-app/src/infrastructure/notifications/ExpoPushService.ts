import { IPushService } from '@/application/communication/services/IPushService';

export class ExpoPushService implements IPushService {
    private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    async send(tokens: string[], title: string, body: string): Promise<void> {
        if (tokens.length === 0) return;

        // Expo allows max 100 messages per chunk
        const chunks = this.chunkArray(tokens, 100);

        for (const chunk of chunks) {
            const messages = chunk.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                badge: 1,
            }));

            try {
                const response = await fetch(this.EXPO_PUSH_URL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messages),
                });

                if (!response.ok) {
                    const error = await response.text();
                    console.error('Expo Push Error:', error);
                }
            } catch (err) {
                console.error('Failed to send push notifications:', err);
            }
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const results = [];
        for (let i = 0; i < array.length; i += size) {
            results.push(array.slice(i, i + size));
        }
        return results;
    }
}
