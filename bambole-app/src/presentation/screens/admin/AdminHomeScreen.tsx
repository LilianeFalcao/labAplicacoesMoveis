import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const AdminHomeScreen = ({ navigation }: any) => {
    const { user, signOut } = useAuth();

    const ActionItem = ({ title, icon, onPress, color }: any) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress}>
            <AppCard style={styles.actionCard}>
                <View style={[styles.iconBadge, { backgroundColor: color + '22' }]}>
                    <MaterialCommunityIcons name={icon} size={32} color={color} />
                </View>
                <Text style={styles.actionTitle}>{title}</Text>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Bambolê Admin"
                rightAction={{
                    icon: 'logout',
                    onPress: signOut
                }}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcome}>Olá, Administrador</Text>
                    <Text style={styles.dateText}>31 de Março, 2026</Text>
                </View>

                <View style={styles.statsRow}>
                    <AppCard style={styles.statCard}>
                        <Text style={styles.statValue}>42</Text>
                        <Text style={styles.statLabel}>Alunos</Text>
                    </AppCard>
                    <AppCard style={[styles.statCard, styles.presentCard]}>
                        <Text style={styles.statValue}>38</Text>
                        <Text style={styles.statLabel}>Presentes</Text>
                    </AppCard>
                    <AppCard style={styles.statCard}>
                        <Text style={styles.statValue}>08</Text>
                        <Text style={styles.statLabel}>Turmas</Text>
                    </AppCard>
                </View>

                <Text style={styles.sectionTitle}>Gerenciamento</Text>
                <View style={styles.grid}>
                    <ActionItem
                        title="Avisos"
                        icon="bullhorn"
                        color={Theme.colors.primary}
                        onPress={() => navigation.navigate('CreateAnnouncement')}
                    />
                    <ActionItem
                        title="Turmas"
                        icon="school"
                        color="#4CAF50"
                        onPress={() => navigation.navigate('GroupManagement')}
                    />
                    <ActionItem
                        title="Monitores"
                        icon="account-tie"
                        color="#FF9800"
                        onPress={() => navigation.navigate('MonitorManagement')}
                    />
                    <ActionItem
                        title="Vínculos"
                        icon="link-variant"
                        color="#2196F3"
                        onPress={() => navigation.navigate('StudentMonitorLinking')}
                    />
                    <ActionItem
                        title="Relatórios"
                        icon="file-chart"
                        color="#9C27B0"
                        onPress={() => { }}
                    />
                    <ActionItem
                        title="Ajustes"
                        icon="cog"
                        color={Theme.colors.gray[600]}
                        onPress={() => { }}
                    />
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
    welcomeSection: {
        marginBottom: Theme.spacing.lg,
    },
    welcome: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    dateText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.xl,
    },
    statCard: {
        width: '31%',
        alignItems: 'center',
        padding: Theme.spacing.sm,
    },
    presentCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    statValue: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    statLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    sectionTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionItem: {
        width: '48%',
        marginBottom: Theme.spacing.md,
    },
    actionCard: {
        alignItems: 'center',
        paddingVertical: Theme.spacing.lg,
    },
    iconBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    actionTitle: {
        ...Theme.typography.body2,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
});
