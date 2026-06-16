import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<any>('parent');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();


    const handleLogin = async () => {
        if (!email) {
            Alert.alert('Erro', 'Por favor, preencha seu e-mail.');
            return;
        }

        if (!password) {
            Alert.alert('Erro', 'Por favor, preencha sua senha.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao autenticar.');
        } finally {
            setLoading(false);
        }
    };



    const RoleFooter = () => {
        if (selectedRole === 'monitor') {
            return (
                <View style={styles.footer}>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="account-tie-voice" size={24} color={Theme.colors.primary} />
                        <Text style={styles.infoCardText}>
                            Acessos de <Text style={{ fontWeight: 'bold' }}>Monitor</Text> são provisionados pela administração. Verifique seu convite no e-mail ou fale com o gestor.
                        </Text>
                    </View>
                </View>
            );
        }

        if (selectedRole === 'admin') {
            return (
                <View style={styles.footer}>
                    <View style={[styles.infoCard, { borderColor: Theme.colors.gray[200] }]}>
                        <MaterialCommunityIcons name="shield-lock" size={24} color={Theme.colors.gray[500]} />
                        <Text style={[styles.infoCardText, { color: Theme.colors.gray[600] }]}>
                            Acesso administrativo restrito à coordenação. O provisionamento é realizado via Dashboard Web.
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Ainda não faz parte da comunidade?</Text>
                <AppButton
                    title="Criar conta de Família"
                    variant="outline"
                    onPress={() => navigation.navigate('SignUp')}
                    style={styles.signUpButton}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerIconButton} />
                <Text style={styles.logo}>Bambolê</Text>
                <View style={styles.headerIconButton} />
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                    <Text style={styles.welcomeTitle}>Bem-vindo de Volta !</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Acesse o portal para gerenciar atividades e acompanhar o progresso dos seus filhos.
                    </Text>

                    <View style={styles.form}>
                        <AppInput
                            label="E-MAIL"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholder="nome@exemplo.com"
                            autoCapitalize="none"
                        />
                        <AppInput
                            label="SENHA"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholder="••••••••"
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Recovery')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                        </TouchableOpacity>

                        <Text style={styles.roleLabel}>Acessar como:</Text>
                        <View style={styles.roleSelector}>
                            <TouchableOpacity
                                style={[styles.roleCard, selectedRole === 'parent' && styles.roleCardActive]}
                                onPress={() => {
                                    setSelectedRole('parent');
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="account-child"
                                    size={24}
                                    color={selectedRole === 'parent' ? '#FFF' : Theme.colors.primary}
                                />
                                <Text style={[styles.roleText, selectedRole === 'parent' && styles.roleTextActive]}>Pai/Mãe</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleCard, selectedRole === 'monitor' && styles.roleCardActive]}
                                onPress={() => {
                                    setSelectedRole('monitor');
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="account-tie"
                                    size={24}
                                    color={selectedRole === 'monitor' ? '#FFF' : Theme.colors.primary}
                                />
                                <Text style={[styles.roleText, selectedRole === 'monitor' && styles.roleTextActive]}>Monitor</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleCard, selectedRole === 'admin' && styles.roleCardActive]}
                                onPress={() => {
                                    setSelectedRole('admin');
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="shield-account"
                                    size={24}
                                    color={selectedRole === 'admin' ? '#FFF' : Theme.colors.primary}
                                />
                                <Text style={[styles.roleText, selectedRole === 'admin' && styles.roleTextActive]}>Escola</Text>
                            </TouchableOpacity>
                        </View>

                        <AppButton
                            title={`Entrar como ${selectedRole === 'parent' ? 'Responsável' : selectedRole === 'monitor' ? 'Monitor' : 'Administrador'}`}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                        />
                    </View>

                    <RoleFooter />
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
        paddingTop: Theme.spacing.md,
        backgroundColor: Theme.colors.surface,
        height: 60,
    },
    headerIconButton: {
        padding: Theme.spacing.sm,
    },
    logo: {
        ...Theme.typography.h2,
        color: Theme.colors.primary,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
        justifyContent: 'center',
    },
    welcomeTitle: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        textAlign: 'center',
        marginTop: Theme.spacing.sm,
        paddingHorizontal: Theme.spacing.md,
    },
    form: {
        width: '100%',
        marginTop: Theme.spacing.xl,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: Theme.spacing.lg,
    },
    forgotPasswordText: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    loginButton: {
        marginBottom: Theme.spacing.md,
        marginTop: Theme.spacing.md,
    },
    roleLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: 'bold',
        marginBottom: Theme.spacing.sm,
        marginTop: Theme.spacing.sm,
    },
    roleSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Theme.spacing.sm,
        marginBottom: Theme.spacing.md,
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: Theme.spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        gap: 4,
    },
    roleCardActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    roleText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
    },
    roleTextActive: {
        color: '#FFF',
    },
    footer: {
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
    },
    footerText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginBottom: Theme.spacing.sm,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: 16,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.primary + '30',
        gap: Theme.spacing.md,
        width: '100%',
    },
    infoCardText: {
        flex: 1,
        ...Theme.typography.caption,
        color: Theme.colors.onBackground,
        lineHeight: 18,
    },
    signUpButton: {
        width: '100%',
        borderRadius: 30,
    },
});
