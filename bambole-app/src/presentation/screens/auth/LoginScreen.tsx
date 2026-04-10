import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
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

        if (password !== '123456') {
            Alert.alert('Erro', "Por favor, use a senha de demonstração '123456'.");
            return;
        }

        setLoading(true);
        try {
            // Simulated login using the typed email and selected role
            signIn(email, selectedRole);
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => Alert.alert('Menu', 'Funcionalidade de menu em desenvolvimento')}
                >
                    <MaterialCommunityIcons name="menu" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
                <Text style={styles.logo}>Bambolê</Text>
                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => Alert.alert('Notificações', 'Funcionalidade de notificações em desenvolvimento')}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
            </View>
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
                                    if (!email.trim()) setEmail('ana.parent@bambole.app');
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
                                    if (!email.trim()) setEmail('pedro.monitor@bambole.app');
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
                                    if (!email.trim()) setEmail('diretoria@bambole.app');
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

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Ainda não faz parte da comunidade?</Text>
                        <AppButton
                            title="Criar conta"
                            variant="outline"
                            onPress={() => navigation.navigate('SignUp')}
                            style={styles.signUpButton}
                        />
                    </View>
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
    signUpButton: {
        width: '100%',
        borderRadius: 30, // More rounded as in design
    },
});
