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
    const [loading, setLoading] = useState(false);
    const { signIn, startSimulation } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

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

                        <AppButton
                            title="Entrar"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                        />

                        <AppButton
                            title="Pré-visualizar App"
                            onPress={handlePreview}
                            variant="outline"
                            style={styles.previewButton}
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
    },
    previewButton: {
        marginBottom: Theme.spacing.xl,
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
