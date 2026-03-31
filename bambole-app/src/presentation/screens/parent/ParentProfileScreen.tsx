import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AppButton } from '../../components/base/AppButton';

export const ParentProfileScreen = () => {
    const { user, signOut } = useAuth();

    const sections = [
        { id: '1', title: 'Dados Pessoais', icon: 'account-edit' },
        { id: '2', title: 'Endereço', icon: 'map-marker' },
        { id: '3', title: 'Notificações', icon: 'bell' },
        { id: '4', title: 'Segurança', icon: 'lock' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader title="Meu Perfil" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={64} color={Theme.colors.onPrimary} />
                    </View>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0]}</Text>
                    <Text style={styles.userEmail}>{user?.email.value}</Text>
                </View>

                <View style={styles.section}>
                    {sections.map(section => (
                        <TouchableOpacity key={section.id}>
                            <AppCard style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name={section.icon as any} size={24} color={Theme.colors.primary} />
                                    </View>
                                    <Text style={styles.menuText}>{section.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.gray[400]} />
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppButton
                    title="Sair da Conta"
                    variant="outline"
                    onPress={signOut}
                    style={styles.logoutButton}
                    textStyle={{ color: Theme.colors.error }}
                />
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
    profileHeader: {
        alignItems: 'center',
        paddingVertical: Theme.spacing.xl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    userName: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    userEmail: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
    },
    section: {
        marginTop: Theme.spacing.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    menuText: {
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: Theme.spacing.xl,
        borderColor: Theme.colors.error,
    },
});
