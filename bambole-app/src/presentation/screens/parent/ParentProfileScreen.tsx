import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AppButton } from '../../components/base/AppButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard } from '../../components/base/AppCard';

export const ParentProfileScreen = () => {
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const sections = [
        { id: '1', title: 'Dados Pessoais', icon: 'account-outline', color: '#3182CE' },
        { id: '2', title: 'Filhos Vinculados', icon: 'account-child-outline', color: '#10B981' },
        { id: '3', title: 'Notificações', icon: 'bell-outline', color: '#F59E0B' },
        { id: '4', title: 'Segurança', icon: 'shield-lock-outline', color: '#6366F1' },
        { id: '5', title: 'Central de Ajuda', icon: 'help-circle-outline', color: '#6B7280' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <TouchableOpacity onPress={signOut} style={styles.logoutIconButton}>
                    <MaterialCommunityIcons name="logout" size={22} color={Theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="account" size={56} color={Theme.colors.onPrimary} />
                        </View>
                        <TouchableOpacity style={styles.editAvatar}>
                            <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0] || 'Maria Silva'}</Text>
                    <Text style={styles.userEmail}>{user?.email.value}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
                    {sections.map(section => (
                        <TouchableOpacity key={section.id} activeOpacity={0.7} style={styles.menuItemContainer}>
                            <AppCard style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${section.color}15` }]}>
                                        <MaterialCommunityIcons name={section.icon as any} size={22} color={section.color} />
                                    </View>
                                    <Text style={styles.menuText}>{section.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.gray[400]} />
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Bambolê v1.0.2</Text>
                    <TouchableOpacity onPress={signOut}>
                        <Text style={styles.logoutLink}>Sair da conta</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    logoutIconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: Theme.spacing.xl,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#DBEAFE',
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Theme.colors.primary,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        ...Theme.typography.h2,
        fontSize: 24,
        color: Theme.colors.onBackground,
    },
    userEmail: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
    section: {
        marginTop: Theme.spacing.md,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#3182CE',
        letterSpacing: 1,
        marginBottom: 16,
    },
    menuItemContainer: {
        marginBottom: Theme.spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 0,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
        fontWeight: '600',
    },
    footer: {
        marginTop: Theme.spacing.xl,
        alignItems: 'center',
        paddingBottom: Theme.spacing.xl,
    },
    versionText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    logoutLink: {
        ...Theme.typography.body2,
        color: Theme.colors.error,
        fontWeight: '700',
        marginTop: 12,
    },
});
