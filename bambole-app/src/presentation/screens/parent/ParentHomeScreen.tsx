import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBadge } from '../../components/base/StatusBadge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Implementation imports
import { SupabaseChildRepository } from '@/infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseGuardianRepository } from '@/infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { SupabaseAttendanceRepository } from '@/infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { SupabaseAnnouncementRepository } from '@/infrastructure/communication/repositories/SupabaseAnnouncementRepository';
import { GetParentDashboardDataUseCase } from '@/application/enrollment/use-cases/GetParentDashboardDataUseCase';
import { ConnectivityService, ConnectivityStatus } from '@/infrastructure/network/ConnectivityService';

export const ParentHomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<ConnectivityStatus>('online');

    // Repositories & Use Case (Ideally these should be provided via DI/Context)
    const childRepo = new SupabaseChildRepository();
    const guardianRepo = new SupabaseGuardianRepository();
    const attendanceRepo = new SupabaseAttendanceRepository();
    const announcementRepo = new SupabaseAnnouncementRepository();
    const getDashboardData = new GetParentDashboardDataUseCase(
        childRepo, 
        guardianRepo, 
        attendanceRepo,
        announcementRepo
    );

    const loadData = useCallback(async () => {
        if (!user) return;
        
        try {
            const data = await getDashboardData.execute(user.id);
            setChildren(data.children);
            setAnnouncements(data.announcements);
        } catch (err) {
            console.error('Error loading parent dashboard data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        const connectivity = ConnectivityService.getInstance();
        const listener = (status: ConnectivityStatus) => setConnectionStatus(status);
        connectivity.addListener(listener);
        
        loadData();

        return () => connectivity.removeListener(listener);
    }, [loadData]);

    const onRefresh = () => {
        if (connectionStatus === 'offline') {
            setRefreshing(false);
            return;
        }
        setRefreshing(true);
        loadData();
    };

    const OfflineBadge = () => {
        if (connectionStatus === 'online') return null;
        return (
            <View style={styles.offlineBadge}>
                <MaterialCommunityIcons name="wifi-off" size={14} color="#B45309" />
                <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
        );
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
                        <Image source={require('../../../../assets/icon-app.png')} style={styles.headerLogoImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.headerBrand}>Bambolê</Text>
                    <OfflineBadge />
                </View>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notices')}>
                    <MaterialCommunityIcons name="bell" size={24} color={Theme.colors.onBackground} />
                    {announcements.length > 0 && <View style={styles.notificationBadge} />}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.userName}>Olá, {user?.fullName ? user.fullName.split(' ')[0] : 'Responsável'}!</Text>
                    <Text style={styles.welcomeSub}>Que bom ter você por aqui. Acompanhe a rotina de hoje.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MEUS FILHOS</Text>
                    </View>

                    {children.length === 0 ? (
                        <AppCard style={styles.emptyCard}>
                            <MaterialCommunityIcons name="account-search-outline" size={48} color={Theme.colors.gray[300]} />
                            <Text style={styles.emptyText}>Nenhum filho vinculado ainda.</Text>
                            <Text style={styles.emptySub}>Entre em contato com a secretaria para vincular seus filhos.</Text>
                        </AppCard>
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={children}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('ChildDetails', { childId: item.id, childName: item.name })}
                                >
                                    <AppCard style={styles.childCard}>
                                        <View style={styles.childCardHeader}>
                                             <View style={[styles.childAvatar, { backgroundColor: item.status === 'present' ? '#E0E7FF' : '#FEE2E2' }]}>
                                                 {item.photoUrl ? (
                                                     <Image source={{ uri: item.photoUrl }} style={styles.childAvatarImage} />
                                                 ) : (
                                                     <Text style={styles.avatarText}>{item.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                                                 )}
                                             </View>
                                             <View style={styles.childInfo}>
                                                 <Text style={styles.childNameText}>{item.name}</Text>
                                                 <Text style={styles.childActivityText}>Turma: {item.className || 'Sem Turma'}</Text>
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
                    )}
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

                    {announcements.length === 0 ? (
                        <Text style={styles.noAnnouncements}>Não há avisos recentes para você.</Text>
                    ) : (
                        announcements.map(ann => (
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
                        ))
                    )}
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        overflow: 'hidden',
    },
    headerLogoImage: {
        width: '100%',
        height: '100%',
    },
    headerBrand: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    offlineBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B45309',
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
        paddingHorizontal: Theme.spacing.lg,
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
        paddingHorizontal: Theme.spacing.lg,
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
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: 10, // Espaço para a sombra não ser cortada em baixo
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
        overflow: 'hidden',
    },
    childAvatarImage: {
        width: '100%',
        height: '100%',
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
        marginHorizontal: Theme.spacing.lg,
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
    emptyCard: {
        marginHorizontal: Theme.spacing.lg,
        padding: Theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: Theme.colors.gray[200],
    },
    emptyText: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.gray[500],
        marginTop: 16,
    },
    emptySub: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: 8,
    },
    noAnnouncements: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        padding: Theme.spacing.md,
    },
});
