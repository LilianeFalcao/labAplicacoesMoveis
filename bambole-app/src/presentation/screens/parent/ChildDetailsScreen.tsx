import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParentStackParamList } from '../../navigation/types';

type ChildDetailsRouteProp = RouteProp<ParentStackParamList, 'ChildDetails'>;
type ChildDetailsNavigationProp = StackNavigationProp<ParentStackParamList, 'ChildDetails'>;

export const ChildDetailsScreen = () => {
    const navigation = useNavigation<ChildDetailsNavigationProp>();
    const route = useRoute<ChildDetailsRouteProp>();
    const { childName = 'Nome do Aluno', class_id = 'A1' } = route.params;

    const activityLogs = [
        { id: '1', time: '08:30', title: 'Check-in', description: 'O aluno chegou na escola.', icon: 'clock-in' },
        { id: '2', time: '10:00', title: 'Lanche', description: 'Fruta e suco.', icon: 'food-apple' },
        { id: '3', time: '12:00', title: 'Almoço', description: 'Arroz, feijão e frango.', icon: 'silverware-fork-knife' },
        { id: '4', time: '14:30', title: 'Atividade', description: 'Pintura com guache.', icon: 'palette' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title={childName}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <AppCard style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="account" size={48} color={Theme.colors.onPrimary} />
                        </View>
                    </View>
                    <Text style={styles.name}>{childName}</Text>
                    <Text style={styles.class}>Turma {class_id}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>95%</Text>
                            <Text style={styles.statLabel}>Frequência</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Atividades</Text>
                        </View>
                    </View>
                </AppCard>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Logs de Hoje</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistory', { childName })}>
                        <Text style={styles.seeHistory}>Histórico</Text>
                    </TouchableOpacity>
                </View>

                {activityLogs.map((log, index) => (
                    <View key={log.id} style={styles.logItem}>
                        <View style={styles.timeline}>
                            <View style={[styles.timelineDot, index === 0 && styles.activeDot]} />
                            {index !== activityLogs.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <AppCard style={styles.logCard}>
                            <View style={styles.logHeader}>
                                <View style={styles.logIconContainer}>
                                    <MaterialCommunityIcons name={log.icon as any} size={20} color={Theme.colors.primary} />
                                </View>
                                <View style={styles.logInfo}>
                                    <Text style={styles.logTitle}>{log.title}</Text>
                                    <Text style={styles.logTime}>{log.time}</Text>
                                </View>
                            </View>
                            <Text style={styles.logDescription}>{log.description}</Text>
                        </AppCard>
                    </View>
                ))}
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
    profileCard: {
        alignItems: 'center',
        paddingVertical: Theme.spacing.lg,
    },
    avatarContainer: {
        marginBottom: Theme.spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    class: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: Theme.spacing.lg,
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: Theme.spacing.md,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        ...Theme.typography.h3,
        color: Theme.colors.primary,
    },
    statLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: Theme.colors.gray[200],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    seeHistory: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    logItem: {
        flexDirection: 'row',
        minHeight: 100,
    },
    timeline: {
        width: 40,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Theme.colors.gray[300],
        zIndex: 1,
        marginTop: Theme.spacing.md,
    },
    activeDot: {
        backgroundColor: Theme.colors.primary,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: Theme.colors.gray[200],
        marginTop: -5,
    },
    logCard: {
        flex: 1,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.xs,
    },
    logIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Theme.colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.sm,
    },
    logInfo: {
        flex: 1,
    },
    logTitle: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    logTime: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    logDescription: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[700],
        marginLeft: 40,
    },
});
