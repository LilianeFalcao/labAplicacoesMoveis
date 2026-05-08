import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ClassDashboardTabsParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MockAgendaRepository, ClassActivity } from '@/infrastructure/activity/repositories/MockAgendaRepository';

type GroupAgendaNavigationProp = BottomTabNavigationProp<ClassDashboardTabsParamList, 'Agenda'>;
type GroupAgendaRouteProp = RouteProp<ClassDashboardTabsParamList, 'Agenda'>;

export const GroupAgendaScreen = () => {
    const navigation = useNavigation<GroupAgendaNavigationProp>();
    const route = useRoute<GroupAgendaRouteProp>();
    const insets = useSafeAreaInsets();
    const { classId, groupName = 'Turma' } = route.params || {};

    const [agendaItems, setAgendaItems] = React.useState<ClassActivity[]>([]);
    const [loading, setLoading] = React.useState(true);

    const loadAgenda = React.useCallback(async () => {
        if (!classId) return;
        const repo = MockAgendaRepository.getInstance();
        const data = await repo.findByClass(classId);
        setAgendaItems(data);
        setLoading(false);
    }, [classId]);

    React.useEffect(() => {
        loadAgenda();
    }, [loadAgenda]);

    const renderAgendaItem = ({ item }: { item: ClassActivity }) => {
        const isCompleted = item.status === 'completed';
        const isOngoing = item.status === 'ongoing';

        return (
            <AppCard style={styles.agendaCard}>
                <View style={styles.agendaHeader}>
                    <View style={[
                        styles.timeTag, 
                        { backgroundColor: isCompleted ? Theme.colors.success + '20' : isOngoing ? Theme.colors.info + '20' : Theme.colors.primary + '20' }
                    ]}>
                        <Text style={[
                            styles.timeText, 
                            { color: isCompleted ? Theme.colors.success : isOngoing ? Theme.colors.info : Theme.colors.primary }
                        ]}>
                            {item.startTime}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={async () => {
                        const newStatus = isCompleted ? 'pending' : 'completed';
                        await MockAgendaRepository.getInstance().updateStatus(item.id, newStatus);
                        loadAgenda();
                    }}>
                        <MaterialCommunityIcons 
                            name={isCompleted ? "checkbox-marked-circle" : isOngoing ? "play-circle-outline" : "checkbox-blank-circle-outline"} 
                            size={24} 
                            color={isCompleted ? Theme.colors.success : isOngoing ? Theme.colors.info : Theme.colors.gray[300]} 
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                {item.description && <Text style={styles.activityDesc}>{item.description}</Text>}
                <View style={styles.agendaFooter}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {isOngoing && (
                        <View style={[styles.categoryBadge, { marginLeft: 8, backgroundColor: Theme.colors.info + '20' }]}>
                            <Text style={[styles.categoryText, { color: Theme.colors.info }]}>Em andamento</Text>
                        </View>
                    )}
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AppHeader 
                title={`Agenda: ${groupName}`} 
                showBack 
                onBack={() => navigation.goBack()}
            />
            
            <FlatList
                data={agendaItems}
                renderItem={renderAgendaItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={64} color={Theme.colors.gray[200]} />
                            <Text style={styles.emptyText}>Nenhuma atividade agendada para hoje.</Text>
                        </View>
                    ) : null
                }
            />

            <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]}>
                <MaterialCommunityIcons name="plus" size={30} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    listContent: {
        padding: Theme.spacing.lg,
    },
    agendaCard: {
        padding: 16,
        marginBottom: 16,
    },
    agendaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
    },
    activityTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    activityDesc: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginBottom: 12,
    },
    agendaFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    categoryBadge: {
        backgroundColor: Theme.colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        color: Theme.colors.gray[500],
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[400],
        marginTop: 16,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});
