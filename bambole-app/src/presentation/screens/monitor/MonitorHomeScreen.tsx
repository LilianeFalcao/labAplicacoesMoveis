import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonitorSummaryCard } from '../../components/monitor/MonitorSummaryCard';
import { TurmaAgendaCard } from '../../components/monitor/TurmaAgendaCard';
import { MONITOR_DASHBOARD_DATA } from './MonitorMockData';

export const MonitorHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { stats, agenda } = MONITOR_DASHBOARD_DATA;

    return (
        <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <MaterialCommunityIcons name="menu" size={24} color={Theme.colors.onBackground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bambolê</Text>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <View style={styles.notificationDot} />
                    <MaterialCommunityIcons name="bell-outline" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSection}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleGroup}>
                            <Text style={styles.overtitle}>PAINEL DO MONITOR</Text>
                            <Text style={styles.mainTitle}>Minhas Turmas</Text>
                        </View>
                        <TouchableOpacity style={styles.solicitarBtn}>
                            <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                            <Text style={styles.solicitarLabel}>Solicitar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryGrid}>
                        <MonitorSummaryCard
                            label="Turmas Ativas"
                            value={stats.activeTurmas}
                            icon="account-group"
                            variant="blue"
                        />
                        <MonitorSummaryCard
                            label="Presença Média"
                            value={stats.avgAttendance}
                            icon="check-decagram"
                            variant="green"
                        />
                    </View>
                </View>

                <View style={styles.agendaSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver tudo</Text>
                        </TouchableOpacity>
                    </View>

                    {agenda.map(item => (
                        <TurmaAgendaCard
                            key={item.id}
                            item={item}
                            onAction={() => navigation.navigate('Attendance', { classId: item.id, groupName: item.name })}
                            onPress={() => navigation.navigate('GroupAgenda', { groupName: item.name })}
                        />
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.fab, { bottom: Math.max(24, insets.bottom + 16) }]}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.error,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#F8FAFC',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.lg,
    },
    topSection: {
        marginBottom: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleGroup: {
        flex: 1,
    },
    overtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#B45309',
        letterSpacing: 1,
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Theme.colors.onBackground,
        lineHeight: 36,
    },
    solicitarBtn: {
        backgroundColor: Theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 4,
        elevation: 4,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        marginLeft: 8,
    },
    solicitarLabel: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
    },
    agendaSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.onBackground,
    },
    seeAllText: {
        fontSize: 14,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});
