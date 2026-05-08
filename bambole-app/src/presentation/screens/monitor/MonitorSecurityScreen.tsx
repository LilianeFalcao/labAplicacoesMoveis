import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { AppCard } from '../../components/base/AppCard';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

export const MonitorSecurityScreen = () => {
    const navigation = useNavigation();
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleToggleBiometrics = async (value: boolean) => {
        if (value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert(
                    'Biometria indisponível',
                    'Seu dispositivo não possui biometria configurada ou compatível.'
                );
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Confirme sua identidade para ativar o bloqueio',
                fallbackLabel: 'Usar senha do dispositivo',
            });

            if (result.success) {
                setIsBiometricsEnabled(true);
                Alert.alert('Sucesso', 'Bloqueio biométrico ativado!');
            }
        } else {
            setIsBiometricsEnabled(false);
        }
    };

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As novas senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Sucesso', 'Sua senha foi atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Segurança" showBack onBack={() => navigation.goBack()} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Proteção do Aplicativo</Text>
                    <AppCard style={styles.securityCard}>
                        <View style={styles.row}>
                            <View style={styles.infoCol}>
                                <Text style={styles.rowTitle}>Bloqueio Biométrico</Text>
                                <Text style={styles.rowDescription}>
                                    Exigir Digital ou FaceID ao abrir o Bambolê
                                </Text>
                            </View>
                            <Switch
                                value={isBiometricsEnabled}
                                onValueChange={handleToggleBiometrics}
                                trackColor={{ false: Theme.colors.gray[200], true: Theme.colors.primary + '80' }}
                                thumbColor={isBiometricsEnabled ? Theme.colors.primary : '#f4f3f4'}
                            />
                        </View>
                    </AppCard>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alterar Senha</Text>
                    <AppCard style={styles.passwordCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Senha Atual</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color={Theme.colors.gray[400]} />
                                <Text style={styles.dummyInput}>••••••••••••</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nova Senha</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-reset" size={20} color={Theme.colors.gray[400]} />
                                <Text style={styles.dummyInput}>Toque para digitar...</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-check-outline" size={20} color={Theme.colors.gray[400]} />
                                <Text style={styles.dummyInput}>Toque para digitar...</Text>
                            </View>
                        </View>

                        <AppButton
                            title="Atualizar Senha"
                            onPress={handleUpdatePassword}
                            loading={loading}
                            style={styles.updateBtn}
                        />
                    </AppCard>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sessões Ativas</Text>
                    <AppCard style={styles.sessionCard}>
                        <View style={styles.sessionItem}>
                            <MaterialCommunityIcons name="cellphone" size={24} color={Theme.colors.primary} />
                            <View style={styles.sessionInfo}>
                                <Text style={styles.sessionDevice}>Este dispositivo (Android)</Text>
                                <Text style={styles.sessionStatus}>Online agora • São Paulo, BR</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutOthers}>
                            <Text style={styles.logoutOthersText}>Encerrar outras sessões</Text>
                        </TouchableOpacity>
                    </AppCard>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: '900',
        color: Theme.colors.gray[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    securityCard: {
        padding: Theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoCol: {
        flex: 1,
        paddingRight: 16,
    },
    rowTitle: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    rowDescription: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    passwordCard: {
        padding: Theme.spacing.md,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
    },
    dummyInput: {
        marginLeft: 12,
        color: Theme.colors.gray[300],
    },
    updateBtn: {
        marginTop: 8,
    },
    sessionCard: {
        padding: Theme.spacing.md,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sessionInfo: {
        marginLeft: 16,
    },
    sessionDevice: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    sessionStatus: {
        ...Theme.typography.caption,
        color: '#10B981',
    },
    logoutOthers: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
        alignItems: 'center',
    },
    logoutOthersText: {
        ...Theme.typography.body2,
        color: Theme.colors.error,
        fontWeight: 'bold',
    },
});
