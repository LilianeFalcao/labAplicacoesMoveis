import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const GroupManagementScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const groups = [
        { id: '1', name: 'Berçário A', monitor: 'Ana Silva', students: 12, capacity: 15, schedule: '08:00 - 12:00' },
        { id: '2', name: 'Berçário B', monitor: 'Ana Silva', students: 8, capacity: 10, schedule: '13:00 - 17:00' },
        { id: '3', name: 'Maternal I', monitor: 'Carlos Oliveira', students: 18, capacity: 20, schedule: '08:00 - 17:00' },
        { id: '4', name: 'Maternal II', monitor: 'Juliana Santos', students: 10, capacity: 20, schedule: '08:00 - 17:00' },
    ];

    const CapacityBar = ({ current, max }: { current: number, max: number }) => {
        const percentage = Math.min((current / max) * 100, 100);
        const isFull = percentage >= 90;

        return (
            <View style={styles.capacityContainer}>
                <View style={styles.capacityHeader}>
                    <Text style={styles.capacityLabel}>Ocupação</Text>
                    <Text style={[styles.capacityValue, isFull && styles.capacityFull]}>
                        {current}/{max}
                    </Text>
                </View>
                <View style={styles.barBackground}>
                    <View style={[
                        styles.barFill,
                        { width: `${percentage}%` },
                        isFull ? { backgroundColor: Theme.colors.error } : { backgroundColor: Theme.colors.primary }
                    ]} />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <AppHeader
                title="Gestão de Turmas"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'plus-circle-outline',
                    onPress: () => { }
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={groups}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerSubtitle}>Visualize e gerencie a lotação e horários de cada turma.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.7}>
                            <AppCard style={styles.groupCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.titleRow}>
                                        <View style={styles.iconCircle}>
                                            <MaterialCommunityIcons name="domain" size={24} color={Theme.colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={styles.groupName}>{item.name}</Text>
                                            <View style={styles.monitorRow}>
                                                <MaterialCommunityIcons name="account-tie" size={14} color={Theme.colors.gray[400]} />
                                                <Text style={styles.monitorName}>{item.monitor}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.scheduleBadge}>
                                        <MaterialCommunityIcons name="clock-outline" size={12} color={Theme.colors.gray[500]} />
                                        <Text style={styles.scheduleText}>{item.schedule}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <CapacityBar current={item.students} max={item.capacity} />

                                <View style={styles.cardFooter}>
                                    <TouchableOpacity style={styles.footerAction}>
                                        <MaterialCommunityIcons name="account-group-outline" size={18} color={Theme.colors.primary} />
                                        <Text style={styles.footerActionText}>Ver Alunos</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.footerAction}>
                                        <MaterialCommunityIcons name="calendar-edit" size={18} color={Theme.colors.gray[500]} />
                                        <Text style={styles.footerActionTextSecondary}>Agenda</Text>
                                    </TouchableOpacity>
                                </View>
                            </AppCard>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    headerInfo: {
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    headerSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        lineHeight: 18,
    },
    groupCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
        flex: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    monitorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    monitorName: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    scheduleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    scheduleText: {
        fontSize: 10,
        color: Theme.colors.gray[600],
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.gray[100],
        marginBottom: Theme.spacing.md,
    },
    capacityContainer: {
        marginTop: 2,
    },
    capacityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    capacityLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
    },
    capacityValue: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[700],
        fontWeight: 'bold',
    },
    capacityFull: {
        color: Theme.colors.error,
    },
    barBackground: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerActionText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    footerActionTextSecondary: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: 'bold',
    },
});
