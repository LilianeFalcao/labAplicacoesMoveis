import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, startSimulation } = useAuth();
    const navigation = useNavigation<any>();

    const handlePreview = () => {
        Alert.alert(
            'Pré-visualizar App',
            'Escolha um perfil para visualizar as telas e o fluxo do aplicativo:',
            [
                { text: 'Administrador', onPress: () => startSimulation('admin') },
                { text: 'Monitor', onPress: () => startSimulation('monitor') },
                { text: 'Pai/Mãe', onPress: () => startSimulation('parent') },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            signIn('parent');
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.logo}>Bambolê</Text>
                    <Text style={styles.subtitle}>Gestão escolar simplificada</Text>
                </View>

                <View style={styles.form}>
                    <AppInput
                        label="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="Ex: joao@email.com"
                        autoCapitalize="none"
                    />
                    <AppInput
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="••••••••"
                    />

                    <AppButton
                        title="Acessar"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />

                    <AppButton
                        title="Pré-visualizar App"
                        onPress={handlePreview}
                        variant="secondary"
                        style={styles.previewButton}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Recovery')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Não tem uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.link}>Criar Conta</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        padding: Theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    logo: {
        ...Theme.typography.h1,
        color: Theme.colors.primary,
        fontSize: 48,
    },
    subtitle: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
        marginTop: Theme.spacing.xs,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: Theme.spacing.md,
    },
    previewButton: {
        marginTop: Theme.spacing.sm,
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: Theme.spacing.md,
    },
    forgotPasswordText: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Theme.spacing.xxl,
    },
    footerText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
    },
    link: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: '700',
        marginLeft: Theme.spacing.xs,
    },
});
