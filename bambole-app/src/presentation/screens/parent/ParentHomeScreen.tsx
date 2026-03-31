import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { OfflineSyncService } from '@/infrastructure/offline/OfflineSyncService';
import { AppCard } from '../../components/base/AppCard';
import { AppHeader } from '../../components/base/AppHeader';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';

export const ParentHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const syncService = new OfflineSyncService();

    const loadData = useCallback(async () => {
        try {
            await syncService.syncDown(user!.id).catch(err => console.log('Offline mode or sync failed', err));
            setChildren(syncService.getCachedChildren());
            setAnnouncements(syncService.getCachedAnnouncements());
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
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Bambolê"
                rightAction={{
                    icon: 'logout',
                    onPress: signOut
                }}
            />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcome}>Bem-vindo,</Text>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0]}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Seus Filhos</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={children}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => navigation.navigate('ChildDetails' as never, { childName: item.name, class_id: item.class_id } as never)}>
                                <AppCard style={styles.childCard}>
                                    <View style={styles.childAvatar}>
                                        <MaterialCommunityIcons name="account" size={32} color={Theme.colors.onPrimary} />
                                    </View>
                                    <Text style={styles.childName} numberOfLines={1}>{item.name}</Text>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                        <Text style={styles.childStatus}>Presente</Text>
                                    </View>
                                    <Text style={styles.childClass}>Turma {item.class_id}</Text>
                                </AppCard>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <AppCard style={styles.emptyCard}>
                                <Text style={styles.emptyText}>Nenhum filho vinculado ainda.</Text>
                            </AppCard>
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Últimos Avisos</Text>
                    {announcements.map(ann => (
                        <AppCard key={ann.id} style={styles.annCard}>
                            <View style={styles.annHeader}>
                                <View style={[styles.annBadge, { backgroundColor: ann.audience_type === 'all' ? Theme.colors.secondary : '#4CAF50' }]}>
                                    <Text style={styles.annBadgeText}>{ann.audience_type === 'all' ? 'Escola' : 'Turma'}</Text>
                                </View>
                                <Text style={styles.annDate}>{new Date(ann.published_at).toLocaleDateString('pt-BR')}</Text>
                            </View>
                            <Text style={styles.annContent}>{ann.content}</Text>
                        </AppCard>
                    ))}
                    {announcements.length === 0 && (
                        <Text style={styles.emptyText}>Nenhum aviso no momento.</Text>
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
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    welcomeSection: {
        marginBottom: Theme.spacing.lg,
    },
    welcome: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
    },
    userName: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
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
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    seeAll: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    childCard: {
        width: 160,
        marginRight: Theme.spacing.md,
        alignItems: 'center',
        padding: Theme.spacing.md,
    },
    childAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    childName: {
        ...Theme.typography.h3,
        fontSize: 16,
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Theme.spacing.xs,
        backgroundColor: Theme.colors.gray[100],
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    childStatus: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[700],
        fontWeight: '600',
    },
    childClass: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
    annCard: {
        padding: Theme.spacing.md,
    },
    annHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    annBadge: {
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    annBadgeText: {
        ...Theme.typography.caption,
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    annDate: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    annContent: {
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        lineHeight: 20,
    },
    emptyCard: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Theme.spacing.xl,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Theme.colors.gray[400],
        elevation: 0,
    },
    emptyText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        fontStyle: 'italic',
    },
});
