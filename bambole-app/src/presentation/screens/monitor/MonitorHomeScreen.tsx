import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '../../components/base/StatusBadge';

export const MonitorHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const groups = [
        { id: '1', name: 'Turma A1', students: 15, time: '08:00 - 12:00', status: 'present', statusLabel: 'Em aula' },
        { id: '2', name: 'Turma B2', students: 12, time: '13:00 - 17:00', status: 'pending', statusLabel: 'Próxima' },
    ];

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <AppHeader
                title="Portal do Monitor"
                rightAction={{
                    icon: 'logout',
                    onPress: signOut
                }}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcome}>Bom dia,</Text>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0]} 👋</Text>
                    <Text style={styles.subtitle}>Pronto para mais um dia de atividades?</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Suas Turmas de Hoje</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.groupsList}>
                    {groups.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => navigation.navigate('GroupAgenda', { groupId: item.id, groupName: item.name })}
                            activeOpacity={0.7}
                        >
                            <AppCard style={styles.groupCard}>
                                <View style={styles.groupContent}>
                                    <View style={styles.groupMainInfo}>
                                        <View style={styles.iconContainer}>
                                            <MaterialCommunityIcons name="account-group" size={24} color={Theme.colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={styles.groupName}>{item.name}</Text>
                                            <Text style={styles.groupDetails}>
                                                <MaterialCommunityIcons name="clock-outline" size={12} /> {item.time}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.groupRight}>
                                        <StatusBadge type={item.status as any} label={item.statusLabel} />
                                        <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.gray[400]} />
                                    </View>
                                </View>
                                <View style={styles.groupFooter}>
                                    <Text style={styles.studentCountText}>{item.students} Alunos vinculados</Text>
                                </View>
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: '#E0F2FE' }]}
                            onPress={() => navigation.navigate('Attendance')}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#BAE6FD' }]}>
                                <MaterialCommunityIcons name="clipboard-check" size={28} color={Theme.colors.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Chamada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: '#F0F9FF' }]}
                            onPress={() => navigation.navigate('PhotoCapture')}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#D1FAE5' }]}>
                                <MaterialCommunityIcons name="camera" size={28} color="#059669" />
                            </View>
                            <Text style={styles.actionLabel}>Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: '#FEF3C7' }]}
                            onPress={() => navigation.navigate('Observations')}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#FDE68A' }]}>
                                <MaterialCommunityIcons name="note-text" size={28} color="#D97706" />
                            </View>
                            <Text style={styles.actionLabel}>Avisos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <AppCard style={styles.nextTurmaCard}>
                    <View style={styles.nextTurmaInfo}>
                        <MaterialCommunityIcons name="calendar-clock" size={24} color={Theme.colors.primary} />
                        <View style={styles.nextTurmaTextContent}>
                            <Text style={styles.nextTurmaTitle}>Próxima atividade</Text>
                            <Text style={styles.nextTurmaValue}>Turma B2 às 13:00</Text>
                        </View>
                    </View>
                    <View style={styles.nextTurmaDivider} />
                    <TouchableOpacity style={styles.viewAgendaBtn}>
                        <Text style={styles.viewAgendaLabel}>Ver agenda completa</Text>
                    </TouchableOpacity>
                </AppCard>
            </ScrollView>
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
    scrollContent: {
        padding: Theme.spacing.md,
    },
    welcomeSection: {
        marginBottom: Theme.spacing.xl,
        marginTop: Theme.spacing.sm,
    },
    welcome: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[500],
        marginBottom: 2,
    },
    userName: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: Theme.spacing.md,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    seeAll: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    groupsList: {
        gap: Theme.spacing.sm,
    },
    groupCard: {
        padding: Theme.spacing.md,
    },
    groupContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    groupMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    groupDetails: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    groupRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.xs,
    },
    groupFooter: {
        marginTop: Theme.spacing.sm,
        paddingTop: Theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
    },
    studentCountText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        fontSize: 10,
    },
    quickActionsSection: {
        marginTop: Theme.spacing.xl,
        marginBottom: Theme.spacing.lg,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.md,
    },
    actionCard: {
        width: '31%',
        aspectRatio: 0.9,
        borderRadius: 16,
        padding: Theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    actionIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    actionLabel: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    nextTurmaCard: {
        padding: Theme.spacing.md,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
    },
    nextTurmaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
    },
    nextTurmaTextContent: {
        flex: 1,
    },
    nextTurmaTitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
    },
    nextTurmaValue: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    nextTurmaDivider: {
        height: 1,
        backgroundColor: Theme.colors.gray[100],
        marginVertical: Theme.spacing.md,
    },
    viewAgendaBtn: {
        alignItems: 'center',
    },
    viewAgendaLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
});
