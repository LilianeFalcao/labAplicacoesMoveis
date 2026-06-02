import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeType, ThemeColors } from '../../styles/Theme';
import { Notification } from '../../../domain/notification/entities/Notification';
import { SupabaseNotificationRepository } from '../../../infrastructure/notification/repositories/SupabaseNotificationRepository';
import { useAuth } from '../../contexts/AuthContext';
import { AppCard } from '../../components/base/AppCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MonitorStackParamList } from '../../navigation/types';

export const NotificationsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<StackNavigationProp<MonitorStackParamList>>();
    const { colors, activeTheme, isDark } = useTheme();
    const styles = createStyles(colors, activeTheme, isDark);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const notificationRepo = SupabaseNotificationRepository.getInstance();

    const loadNotifications = async () => {
        if (!user?.id) return;
        const data = await notificationRepo.findByRecipientId(user.id);
        setNotifications(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
            const unsubscribe = notificationRepo.subscribe(() => {
                loadNotifications();
            });
            return () => unsubscribe();
        }, [user?.id])
    );

    const handleMarkAsRead = async (id: string | undefined) => {
        if (id) {
            await notificationRepo.markAsRead(id);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        const unread = notifications.filter(n => !n.read);
        for (const notif of unread) {
            if (notif.id) {
                await notificationRepo.markAsRead(notif.id);
            }
        }
        await loadNotifications();
    };

    const getNotificationStatus = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('concluída') || t.includes('sucesso') || t.includes('aprovado') || t.includes('confirmada') || t.includes('oba')) {
            return 'success';
        }
        if (t.includes('erro') || t.includes('falha') || t.includes('ops') || t.includes('aviso') || t.includes('atenção') || t.includes('pendente') || t.includes('recusada') || t.includes('negado')) {
            return 'error';
        }
        return 'info';
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const status = getNotificationStatus(item.title);
        
        let statusColor = colors.primary;
        let iconName: any = 'bell-ring-outline';
        
        if (status === 'success') {
            statusColor = colors.success;
            iconName = 'check-circle-outline';
        } else if (status === 'error') {
            statusColor = colors.error;
            iconName = 'alert-circle-outline';
        }

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleMarkAsRead(item.id)}>
                <AppCard style={[
                    styles.notificationCard, 
                    !item.read && styles.unreadCard,
                    { borderLeftColor: statusColor }
                ]}>
                    <View style={[styles.iconBox, { backgroundColor: `${statusColor}15` }]}>
                        <MaterialCommunityIcons 
                            name={iconName} 
                            size={22} 
                            color={statusColor} 
                        />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.time}>{item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                </AppCard>
            </TouchableOpacity>
        );
    };

    const hasUnread = notifications.some(n => !n.read);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('MonitorRoot', { screen: 'Home' })} 
                    style={styles.backBtn}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onBackground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificações</Text>
                {hasUnread ? (
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerActionBtn}>
                        <MaterialCommunityIcons name="check-all" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.headerActionText}>Marcar todas como lidas</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id || Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.gray[400]} />
                        </View>
                        <Text style={styles.emptyTitle}>Tudo limpo por aqui!</Text>
                        <Text style={styles.emptyText}>
                            Não há novas notificações no momento. Quando algo importante acontecer, você será avisado.
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeColors, theme: ThemeType, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? colors.gray[200] : colors.gray[100],
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        ...theme.typography.h3,
        fontWeight: 'bold',
        color: colors.onBackground,
    },
    headerActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: isDark ? colors.primary + '20' : colors.primary + '08',
    },
    headerActionText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: colors.primary,
    },
    listContent: {
        padding: theme.spacing.lg,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: isDark ? colors.gray[100] + '25' : colors.primary + '06',
        borderColor: colors.primary + '15',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        ...theme.typography.body1,
        fontWeight: 'bold',
        color: colors.onBackground,
        marginBottom: 4,
    },
    message: {
        ...theme.typography.body2,
        color: colors.gray[500],
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        ...theme.typography.caption,
        color: colors.gray[400],
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
        marginTop: 16,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        ...theme.typography.h3,
        color: colors.onBackground,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyText: {
        ...theme.typography.body2,
        color: colors.gray[400],
        textAlign: 'center',
        lineHeight: 22,
    },
});
