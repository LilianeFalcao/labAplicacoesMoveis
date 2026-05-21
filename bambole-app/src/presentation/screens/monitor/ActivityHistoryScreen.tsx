import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { MockActivityRepository } from '../../../infrastructure/activity/repositories/MockActivityRepository';
import { SupabaseIncidentRepository } from '../../../infrastructure/activity/repositories/SupabaseIncidentRepository';

interface HistoryItem {
    id: string;
    type: 'photo' | 'incident';
    title: string;
    description?: string;
    timestamp: Date;
    photoUri?: string;
    isEmergency?: boolean;
}

export const ActivityHistoryScreen = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        setRefreshing(true);
        try {
            const monitorId = user?.id || 'monitor-mock-id';
            const photoRepo = MockActivityRepository.getInstance();
            const incidentRepo = new SupabaseIncidentRepository();

            const [photos, incidents] = await Promise.all([
                photoRepo.getFeedByMonitor(monitorId),
                incidentRepo.findByMonitorId(monitorId)
            ]);

            const mappedPhotos: HistoryItem[] = photos.map(p => ({
                id: p.id,
                type: 'photo',
                title: 'Foto Enviada',
                description: p.caption,
                timestamp: p.timestamp,
                photoUri: p.photoUri
            }));

            const mappedIncidents: HistoryItem[] = incidents.map(i => ({
                id: i.id,
                type: 'incident',
                title: i.isEmergency ? 'Incidente Crítico' : 'Relato de Incidente',
                description: i.description,
                timestamp: i.createdAt,
                isEmergency: i.isEmergency
            }));

            const combined = [...mappedPhotos, ...mappedIncidents].sort(
                (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
            );

            setHistory(combined);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <AppCard style={[styles.card, item.isEmergency && styles.emergencyCard]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'photo' ? '#E0F2FE' : '#FEE2E2' }]}>
                    <MaterialCommunityIcons 
                        name={item.type === 'photo' ? 'camera-outline' : 'alert-circle-outline'} 
                        size={20} 
                        color={item.type === 'photo' ? Theme.colors.primary : Theme.colors.error} 
                    />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardTime}>{item.timestamp.toLocaleString()}</Text>
                </View>
            </View>
            
            {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
            
            {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.previewImage} />
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Histórico de Atividades" />
            
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => `${item.type}-${item.id}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadHistory} tintColor={Theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma atividade registrada ainda.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    card: {
        marginBottom: Theme.spacing.md,
        padding: Theme.spacing.md,
    },
    emergencyCard: {
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.error,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    cardTitle: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    cardTime: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    cardDesc: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginBottom: 8,
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        marginTop: 8,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[400],
        textAlign: 'center',
    },
});
