import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Incident } from '../../../domain/activity/entities/Incident';
import { MockIncidentRepository } from '../../../infrastructure/activity/repositories/MockIncidentRepository';

export const AdminIncidentListScreen = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadIncidents = async () => {
        setRefreshing(true);
        try {
            const repository = MockIncidentRepository.getInstance();
            const data = await repository.getAll();
            setIncidents(data);
        } catch (error) {
            console.error("Failed to load incidents", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadIncidents();
    }, []);

    const renderItem = ({ item }: { item: Incident }) => (
        <AppCard style={[styles.card, item.isEmergency && styles.emergencyCard]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.isEmergency ? '#FEE2E2' : '#F1F5F9' }]}>
                    <MaterialCommunityIcons 
                        name={item.isEmergency ? "alert-decagram" : "clipboard-text-outline"} 
                        size={24} 
                        color={item.isEmergency ? Theme.colors.error : Theme.colors.gray[600]} 
                    />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.dateText}>{item.createdAt.toLocaleString()}</Text>
                    {item.isEmergency && <Text style={styles.emergencyLabel}>CRÍTICO</Text>}
                </View>
            </View>

            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="account-tie" size={14} color={Theme.colors.gray[400]} />
                    <Text style={styles.metaText}>{item.monitorId}</Text>
                </View>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="domain" size={14} color={Theme.colors.gray[400]} />
                    <Text style={styles.metaText}>{item.classId}</Text>
                </View>
            </View>

            {item.photoUrls.length > 0 && (
                <View style={styles.photoSection}>
                    <Text style={styles.photoCount}>{item.photoUrls.length} Foto(s)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                        {item.photoUrls.map((uri, index) => (
                            <Image key={index} source={{ uri }} style={styles.photoPreview} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Incidentes e Alertas" />
            
            <FlatList
                data={incidents}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadIncidents} tintColor={Theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="shield-check-outline" size={64} color={Theme.colors.gray[200]} />
                        <Text style={styles.emptyText}>Tudo calmo por aqui. Nenhum incidente relatado.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

// Sub-component for Horizontal ScrollView since it's nested
import { ScrollView } from 'react-native-gesture-handler';

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
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
    },
    emergencyLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.error,
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    description: {
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        lineHeight: 20,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    photoSection: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
    },
    photoCount: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[500],
        marginBottom: 8,
    },
    photoList: {
        flexDirection: 'row',
    },
    photoPreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: Theme.colors.gray[100],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: 16,
    },
});
