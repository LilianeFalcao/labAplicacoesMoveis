import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { AppHeader } from '../../components/base/AppHeader';
import { TurmaAgendaCard } from '../../components/monitor/TurmaAgendaCard';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { SupabaseAccessRequestRepository } from '../../../infrastructure/activity/repositories/SupabaseAccessRequestRepository';
import { GetMonitorClassesUseCase } from '../../../application/activity/use-cases/GetMonitorClassesUseCase';
import { useNavigation } from '@react-navigation/native';

export const MonitorClassesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [classes, setClasses] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadClasses = useCallback(async () => {
        setRefreshing(true);
        try {
            const classRepo = new SupabaseClassRepository();
            const accessRepo = new SupabaseAccessRequestRepository();
            const useCase = new GetMonitorClassesUseCase(classRepo, accessRepo);
            
            const monitorId = user?.id || 'monitor-mock-id';
            const data = await useCase.execute(monitorId);
            
            const agendaItems = data.map((cls) => {
                const isAvailable = cls.isCallAllowedNow();
                return {
                    id: cls.id,
                    name: cls.name,
                    category: 'Regular',
                    status: isAvailable ? ('pending' as const) : ('upcoming' as const),
                    statusLabel: isAvailable ? 'Em Andamento' : 'Próxima Aula',
                    ageGroup: cls.ageGroup,
                    timeLabel: cls.timeLabel,
                    location: 'A definir',
                    students: 0
                };
            });
            
            setClasses(agendaItems);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Minhas Turmas" />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadClasses} tintColor={Theme.colors.primary} />
                }
            >
                <View style={styles.headerInfo}>
                    <Text style={styles.subtitle}>Gerencie suas turmas atribuídas e solicitações aprovadas.</Text>
                </View>

                {classes.length > 0 ? (
                    classes.map(item => (
                        <TurmaAgendaCard
                            key={item.id}
                            item={item}
                            onAction={() => navigation.navigate('ClassDashboard', { classId: item.id, groupName: item.name })}
                            onPress={() => navigation.navigate('ClassDashboard', { classId: item.id, groupName: item.name })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Você não possui turmas atribuídas no momento.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    headerInfo: {
        marginBottom: 20,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
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
