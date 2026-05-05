import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { Notification } from '../../../domain/notification/entities/Notification';
import { MockNotificationRepository } from '../../../infrastructure/notification/repositories/MockNotificationRepository';
import { useAuth } from '../../contexts/AuthContext';
import { AppCard } from '../../components/base/AppCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MonitorStackParamList } from '../../navigation/types';

export const NotificationsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<StackNavigationProp<MonitorStackParamList>>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const notificationRepo = MockNotificationRepository.getInstance();

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

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleMarkAsRead(item.id)}>
            <AppCard style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons 
                        name={item.title.includes('Aprovado') ? 'check-decagram' : 'alert-circle'} 
                        size={24} 
                        color={item.title.includes('Aprovado') ? Theme.colors.success : Theme.colors.error} 
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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('MonitorRoot', { screen: 'Home' })} 
                    style={styles.backBtn}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificações</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id || Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-sleep" size={64} color={Theme.colors.gray[300]} />
                        <Text style={styles.emptyText}>Você não tem novas notificações.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        paddingTop: Theme.spacing.sm,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    listContent: {
        padding: Theme.spacing.lg,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        alignItems: 'flex-start',
    },
    unreadCard: {
        backgroundColor: '#F0F9FF',
        borderColor: Theme.colors.primary + '30',
        borderWidth: 1,
    },
    iconBox: {
        marginRight: Theme.spacing.md,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    message: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.primary,
        marginTop: 6,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[500],
        marginTop: 16,
    },
});
