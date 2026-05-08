import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export const MonitorSettingsScreen = () => {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const SettingRow = ({ icon, label, description, children }: any) => (
        <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={icon} size={22} color={Theme.colors.primary} />
                </View>
                <View style={styles.textColumn}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {description && <Text style={styles.settingDesc}>{description}</Text>}
                </View>
            </View>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Configurações" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Aparência</Text>
                <AppCard style={styles.card}>
                    <SettingRow 
                        icon="theme-light-dark" 
                        label="Modo Escuro" 
                        description="Reduza o cansaço visual em ambientes escuros."
                    >
                        <Switch 
                            value={darkMode} 
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#CBD5E1', true: Theme.colors.primary + '80' }}
                            thumbColor={darkMode ? Theme.colors.primary : '#F1F5F9'}
                        />
                    </SettingRow>
                </AppCard>

                <Text style={styles.sectionTitle}>Preferências</Text>
                <AppCard style={styles.card}>
                    <SettingRow 
                        icon="bell-outline" 
                        label="Notificações Push" 
                        description="Receba alertas de novos incidentes e mensagens."
                    >
                        <Switch 
                            value={notifications} 
                            onValueChange={setNotifications}
                            trackColor={{ false: '#CBD5E1', true: Theme.colors.primary + '80' }}
                            thumbColor={notifications ? Theme.colors.primary : '#F1F5F9'}
                        />
                    </SettingRow>
                </AppCard>

                <Text style={styles.sectionTitle}>Sobre a Conta</Text>
                <AppCard style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID do Monitor</Text>
                        <Text style={styles.infoValue}>{user?.id || 'monitor-mock-id'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versão do App</Text>
                        <Text style={styles.infoValue}>1.0.4 (Beta)</Text>
                    </View>
                </AppCard>

                <TouchableOpacity style={styles.dangerZone}>
                    <Text style={styles.dangerText}>Excluir Dados de Cache</Text>
                </TouchableOpacity>
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
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
        marginTop: 20,
    },
    card: {
        padding: Theme.spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textColumn: {
        flex: 1,
    },
    settingLabel: {
        ...Theme.typography.body1,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
    settingDesc: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
    },
    infoValue: {
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        fontWeight: 'bold',
    },
    dangerZone: {
        marginTop: 40,
        alignItems: 'center',
        padding: 12,
    },
    dangerText: {
        ...Theme.typography.caption,
        color: Theme.colors.error,
        fontWeight: 'bold',
    }
});
