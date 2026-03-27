import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { OfflineSyncService } from '@/infrastructure/offline/OfflineSyncService';

export const ParentHomeScreen = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const syncService = new OfflineSyncService();

    const loadData = useCallback(async () => {
        try {
            // 1. Try sync down if online (Simplified)
            await syncService.syncDown(user!.id).catch(err => console.log('Offline mode or sync failed', err));

            // 2. Load from cache
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

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#6C5CE7" />;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcome}>Olá, </Text>
                <Text style={styles.userName}>{user?.email.value.split('@')[0]}</Text>
            </View>

            <Text style={styles.sectionTitle}>Seus Filhos</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={children}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.childCard}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{item.name?.[0]}</Text>
                        </View>
                        <Text style={styles.childName}>{item.name}</Text>
                        <Text style={styles.childClass}>Turma: {item.class_id}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum aluno vinculado.</Text>}
                style={styles.childrenList}
            />

            <Text style={styles.sectionTitle}>Mural de Avisos</Text>
            {announcements.map(ann => (
                <View key={ann.id} style={styles.annCard}>
                    <View style={[styles.annType, ann.audience_type === 'all' ? styles.allType : styles.classType]}>
                        <Text style={styles.typeText}>{ann.audience_type === 'all' ? 'Escola' : 'Turma'}</Text>
                    </View>
                    <Text style={styles.annContent}>{ann.content}</Text>
                    <Text style={styles.annDate}>{new Date(ann.published_at).toLocaleDateString('pt-BR')}</Text>
                </View>
            ))}
            {announcements.length === 0 && <Text style={styles.empty}>Nenhum aviso no momento.</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 30, marginTop: 20 },
    welcome: { fontSize: 18, color: '#636E72' },
    userName: { fontSize: 28, fontWeight: 'bold', color: '#2D3436' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2D3436', marginBottom: 15 },
    childrenList: { marginBottom: 30 },
    childCard: {
        backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginRight: 15,
        alignItems: 'center', width: 150,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5
    },
    avatarPlaceholder: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#6C5CE7',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    childName: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
    childClass: { fontSize: 12, color: '#B2BEC3', marginTop: 4 },
    annCard: {
        backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15,
        borderLeftWidth: 5, borderLeftColor: '#6C5CE7'
    },
    annType: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginBottom: 8 },
    allType: { backgroundColor: '#E17055' },
    classType: { backgroundColor: '#00B894' },
    typeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    annContent: { fontSize: 15, color: '#2D3436', lineHeight: 22 },
    annDate: { fontSize: 11, color: '#B2BEC3', marginTop: 10, textAlign: 'right' },
    empty: { color: '#B2BEC3', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }
});
