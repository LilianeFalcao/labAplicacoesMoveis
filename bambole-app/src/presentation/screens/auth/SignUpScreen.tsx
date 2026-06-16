import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SignUpScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signUp, isLoading } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSignUp = async () => {
        // Validation logic
        if (!name.trim()) {
            Alert.alert('Campo Obrigatório', 'Por favor, informe seu nome completo.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Email Inválido', 'Por favor, informe um endereço de e-mail válido.');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Senha Fraca', 'A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Senhas Diferentes', 'As senhas informadas não coincidem.');
            return;
        }

        try {
            await signUp(name, email, password);
            Alert.alert(
                'Boas-vindas!', 
                'Sua conta foi criada com sucesso. Verifique seu e-mail para confirmar o cadastro.',
                [{ text: 'Entendido', onPress: () => navigation.replace('ParentHome') }]
            );
        } catch (error: any) {
            Alert.alert('Erro no Cadastro', error.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
                <Text style={styles.headerLogo}>Bambolê</Text>
                <View style={styles.placeholder} />
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <View style={styles.familyBadge}>
                        <MaterialCommunityIcons name="account-group" size={16} color={Theme.colors.primary} />
                        <Text style={styles.familyBadgeText}>PORTAL DA FAMÍLIA</Text>
                    </View>
                    <Text style={styles.title}>Cadastro de Responsável</Text>
                    <Text style={styles.subtitle}>Crie sua conta para acompanhar a jornada do seu filho no Centro Bambolê.</Text>
                </View>

                <View style={styles.linkWarning}>
                    <MaterialCommunityIcons name="email-check-outline" size={24} color="#0369A1" />
                    <View style={styles.linkWarningContent}>
                        <Text style={styles.linkWarningTitle}>Vínculo Escolar Automático</Text>
                        <Text style={styles.linkWarningText}>
                            Utilize o <Text style={{ fontWeight: 'bold' }}>mesmo e-mail</Text> fornecido à secretaria da escola para que seus filhos apareçam automaticamente no seu feed.
                        </Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <AppInput
                        label="NOME COMPLETO"
                        value={name}
                        onChangeText={setName}
                        placeholder="Como deseja ser chamado"
                    />
                    <AppInput
                        label="EMAIL"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="exemplo@email.com"
                        autoCapitalize="none"
                    />
                    <AppInput
                        label="SENHA"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Mínimo 8 caracteres"
                    />
                    <AppInput
                        label="CONFIRMAR SENHA"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Repita sua senha"
                    />

                    <AppButton
                        title="Finalizar Cadastro"
                        onPress={handleSignUp}
                        loading={isLoading}
                        icon="check-circle-outline"
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Já possui uma conta?</Text>
                    <AppButton
                        title="Já tenho conta"
                        variant="ghost"
                        icon="login-variant"
                        iconPosition="right"
                        onPress={() => navigation.goBack()}
                        style={styles.ghostButton}
                    />
                </View>

                <View style={styles.securityNote}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={Theme.colors.gray[600]} />
                    <Text style={styles.securityText}>AMBIENTE SEGURO & CRIPTOGRAFADO</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
        height: 60,
        backgroundColor: Theme.colors.surface,
    },
    backButton: {
        padding: Theme.spacing.sm,
    },
    headerLogo: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        fontWeight: '800',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    badgeContainer: {
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
        marginBottom: Theme.spacing.md,
    },
    badge: {
        backgroundColor: Theme.colors.secondary,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        ...Theme.typography.caption,
        color: '#065F46', // Dark green text
        fontWeight: '900',
    },
    intro: {
        marginBottom: Theme.spacing.lg,
        alignItems: 'center',
    },
    familyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: Theme.spacing.sm,
        gap: 6,
    },
    familyBadgeText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        fontSize: 28,
        textAlign: 'center',
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        textAlign: 'center',
        marginTop: Theme.spacing.xs,
        lineHeight: 22,
    },
    linkWarning: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        gap: Theme.spacing.md,
    },
    linkWarningContent: {
        flex: 1,
    },
    linkWarningTitle: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: '#0369A1',
        marginBottom: 2,
    },
    linkWarningText: {
        ...Theme.typography.caption,
        color: '#075985',
        lineHeight: 18,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: Theme.spacing.lg,
    },
    footer: {
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
    },
    footerText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
    },
    ghostButton: {
        marginTop: Theme.spacing.xs,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        width: '100%',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Theme.spacing.xxl,
        paddingBottom: Theme.spacing.md,
    },
    securityText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
        marginLeft: Theme.spacing.xs,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
