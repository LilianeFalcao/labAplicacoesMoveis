import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { OfflineSyncService } from '@/infrastructure/offline/OfflineSyncService';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBadge } from '../../components/base/StatusBadge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ParentHomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const syncService = new OfflineSyncService();

    const loadData = useCallback(async () => {
        try {
            await syncService.syncDown(user!.id).catch(err => console.log('Offline mode or sync failed', err));
            // Mocking more detailed data for the redesign demonstration
            const cachedChildren = syncService.getCachedChildren();
            const enrichedChildren = cachedChildren.length > 0 ? cachedChildren : [
                { id: '1', name: 'Lucas Ferreira', activity: 'Futebol', schedule: 'Seg/Qua/Sex • 14h-17h', status: 'present', label: 'Presente' },
                { id: '2', name: 'Ana Souza', activity: 'Dança', schedule: 'Ter/Qui • 13h-16h', status: 'pending', label: 'Sem chamada' }
            ];

            setChildren(enrichedChildren);

            const cachedAnn = syncService.getCachedAnnouncements();
            setAnnouncements(cachedAnn.length > 0 ? cachedAnn : [
                { id: '1', title: 'Uniforme de natação obrigatório para a aula de amanhã.', type: 'alert', date: 'HOJE, 09:30', icon: 'bullhorn-variant' },
                { id: '2', title: 'Reunião de pais e mestres agendada para sábado, 09:00.', type: 'pending', date: 'ONTEM', icon: 'calendar-text' }
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarMini}>
                        <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color={Theme.colors.primary} />
                    </View>
                    <Text style={styles.headerBrand}>Bambolê</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell" size={24} color={Theme.colors.onBackground} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.userName}>Olá, Linn!</Text>
                    <Text style={styles.welcomeSub}>Acompanhe as atividades de hoje.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MEUS FILHOS</Text>
                    </View>

                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={children}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('ParentStack', { screen: 'ChildDetails', params: { childName: item.name, class_id: item.class_id || '1' } })}
                            >
                                <AppCard style={styles.childCard}>
                                    <View style={styles.childCardHeader}>
                                        <View style={[styles.childAvatar, { backgroundColor: item.status === 'present' ? '#E0E7FF' : '#FFE4E6' }]}>
                                            <Text style={styles.avatarText}>{item.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                                        </View>
                                        <View style={styles.childInfo}>
                                            <Text style={styles.childNameText}>{item.name}</Text>
                                            <Text style={styles.childActivityText}>{item.activity || 'Atividade'} —</Text>
                                            <Text style={styles.childScheduleText}>{item.schedule || 'Schedules'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.childCardFooter}>
                                        <StatusBadge type={item.status as any} label={item.label} />
                                    </View>
                                </AppCard>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.childrenList}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>AVISOS RECENTES</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
                            <View style={styles.seeAllContainer}>
                                <Text style={styles.seeAll}>Ver todos</Text>
                                <MaterialCommunityIcons name="arrow-right" size={16} color="#92400E" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {announcements.map(ann => (
                        <AppCard key={ann.id} style={styles.annCard}>
                            <View style={[styles.annIconContainer, { backgroundColor: ann.type === 'alert' ? '#FFEDD5' : '#DBEAFE' }]}>
                                <MaterialCommunityIcons
                                    name={ann.icon as any}
                                    size={20}
                                    color={ann.type === 'alert' ? '#92400E' : '#1E40AF'}
                                />
                            </View>
                            <View style={styles.annContent}>
                                <Text style={styles.annTitle}>{ann.title}</Text>
                                <Text style={styles.annDate}>{ann.date}</Text>
                            </View>
                        </AppCard>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMini: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerBrand: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    welcomeSection: {
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
    },
    userName: {
        ...Theme.typography.h1,
        fontSize: 28,
        color: Theme.colors.onBackground,
    },
    welcomeSub: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
        marginTop: 4,
    },
    section: {
        marginBottom: Theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#3182CE',
        letterSpacing: 1,
    },
    seeAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAll: {
        ...Theme.typography.caption,
        color: '#92400E',
        fontWeight: '700',
        marginRight: 4,
    },
    childrenList: {
        paddingRight: Theme.spacing.lg,
    },
    childCard: {
        width: 280,
        marginRight: Theme.spacing.md,
        padding: Theme.spacing.xl,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
    },
    childCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        fontSize: 18,
    },
    childInfo: {
        flex: 1,
    },
    childNameText: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
        marginBottom: 2,
    },
    childActivityText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
    },
    childScheduleText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
    },
    childCardFooter: {
        marginTop: 16,
        alignItems: 'flex-end',
    },
    annCard: {
        flexDirection: 'row',
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        backgroundColor: '#EFF6FF',
        borderRadius: 20,
        alignItems: 'center',
        elevation: 0,
    },
    annIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    annContent: {
        flex: 1,
    },
    annTitle: {
        ...Theme.typography.body2,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    annDate: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
});
