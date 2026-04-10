import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AdminHomeScreen = ({ navigation }: any) => {
    const { signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const ActionItem = ({ title, icon, onPress, color, description }: any) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
            <AppCard style={styles.actionCard}>
                <View style={[styles.iconBadge, { backgroundColor: color + '15' }]}>
                    <MaterialCommunityIcons name={icon} size={28} color={color} />
                </View>
                <View style={styles.actionTextContent}>
                    <Text style={styles.actionTitle}>{title}</Text>
                    <Text style={styles.actionDescription} numberOfLines={1}>{description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.gray[300]} />
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Painel Administrativo"
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
                <View style={styles.headerSection}>
                    <View>
                        <Text style={styles.welcome}>Olá, Administrador 👋</Text>
                        <Text style={styles.dateText}>Terça-feira, 31 de Março</Text>
                    </View>
                    <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="shield-account" size={32} color={Theme.colors.primary} />
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <AppCard style={styles.statCard}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
                            <MaterialCommunityIcons name="account-group" size={20} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.statValue}>42</Text>
                        <Text style={styles.statLabel}>Alunos</Text>
                    </AppCard>

                    <AppCard style={styles.statCard}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#059669" />
                        </View>
                        <Text style={styles.statValue}>38</Text>
                        <Text style={styles.statLabel}>Presentes</Text>
                    </AppCard>

                    <AppCard style={styles.statCard}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                            <MaterialCommunityIcons name="school" size={20} color="#D97706" />
                        </View>
                        <Text style={styles.statValue}>08</Text>
                        <Text style={styles.statLabel}>Turmas</Text>
                    </AppCard>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Gerenciamento Geral</Text>
                </View>

                <View style={styles.managementList}>
                    <ActionItem
                        title="Avisos e Mural"
                        description="Comunicados oficiais para toda a escola"
                        icon="bullhorn-outline"
                        color={Theme.colors.primary}
                        onPress={() => navigation.navigate('CreateAnnouncement')}
                    />
                    <ActionItem
                        title="Gestão de Turmas"
                        description="Horários, capacidades e atividades"
                        icon="domain"
                        color="#059669"
                        onPress={() => navigation.navigate('GroupManagement')}
                    />
                    <ActionItem
                        title="Equipe de Monitores"
                        description="Cadastro e atribuição de turmas"
                        icon="account-tie-outline"
                        color="#D97706"
                        onPress={() => navigation.navigate('MonitorManagement')}
                    />
                    <ActionItem
                        title="Vínculos e Família"
                        description="Conectar pais a alunos e monitores"
                        icon="link-variant"
                        color="#6366F1"
                        onPress={() => navigation.navigate('StudentMonitorLinking')}
                    />
                    <ActionItem
                        title="Relatórios e Logs"
                        description="Histórico de presença e atividades"
                        icon="file-chart-outline"
                        color="#8B5CF6"
                        onPress={() => { }}
                    />
                </View>

                <AppCard style={styles.quickSettingsCard}>
                    <View style={styles.settingsInfo}>
                        <MaterialCommunityIcons name="cog-outline" size={24} color={Theme.colors.gray[600]} />
                        <View style={styles.settingsText}>
                            <Text style={styles.settingsTitle}>Configurações do Sistema</Text>
                            <Text style={styles.settingsSubtitle}>Ajustes de segurança e permissões</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.settingsBtn}>
                        <Text style={styles.settingsBtnText}>Acessar</Text>
                    </TouchableOpacity>
                </AppCard>
            </ScrollView>
        </SafeAreaView>
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
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        marginTop: Theme.spacing.sm,
    },
    welcome: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        fontSize: 22,
    },
    dateText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.xl,
    },
    statCard: {
        width: '31%',
        alignItems: 'flex-start',
        padding: Theme.spacing.md,
    },
    statIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
        fontSize: 20,
    },
    statLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        fontWeight: '600',
    },
    sectionHeader: {
        marginBottom: Theme.spacing.md,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    managementList: {
        gap: Theme.spacing.sm,
    },
    actionItem: {
        width: '100%',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.md,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    actionTextContent: {
        flex: 1,
    },
    actionTitle: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    actionDescription: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    quickSettingsCard: {
        marginTop: Theme.spacing.xl,
        padding: Theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    settingsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
        flex: 1,
    },
    settingsText: {
        flex: 1,
    },
    settingsTitle: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    settingsSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    settingsBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    settingsBtnText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[700],
        fontWeight: '700',
    },
});
