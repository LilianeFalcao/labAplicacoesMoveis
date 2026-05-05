import { Platform } from 'react-native';

let Notifications: any = null;
try {
    // Em pacotes mais recentes, o expo-notifications pode estourar erro no Expo Go (SDK 53+)
    // Usamos require dinâmico com try-catch para evitar que a tela vermelha bloqueie o app.
    if (Platform.OS !== 'web') {
        Notifications = require('expo-notifications');
    }
} catch (error) {
    console.warn("expo-notifications não suportado neste ambiente (Expo Go). Usando mock.", error);
    Notifications = null;
}

export class NotificationService {
    private static instance: NotificationService;

    private constructor() {
        if (Notifications && Platform.OS !== 'web') {
            try {
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                        shouldShowBanner: true,
                        shouldShowList: true,
                    }),
                });
            } catch (e) {
                console.warn("Erro ao configurar NotificationHandler", e);
            }
        }
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async sendPushNotification(title: string, body: string, data?: any): Promise<void> {
        if (!Notifications || Platform.OS === 'web') {
            console.log(`[Mock Notification] ${title}: ${body}`);
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                },
                trigger: null, // Send immediately
            });
        } catch (e) {
            console.warn("Erro ao enviar notificação local", e);
        }
    }

    async requestPermissions(): Promise<boolean> {
        if (!Notifications || Platform.OS === 'web') return true;

        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            return finalStatus === 'granted';
        } catch (e) {
            console.warn("Erro ao solicitar permissões", e);
            return false;
        }
    }
}
