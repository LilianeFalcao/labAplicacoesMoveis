import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SignUpScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            Alert.alert('Sucesso', 'Conta criada com sucesso! Verifique seu e-mail.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
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
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Comece a jornada do seu filho em nosso centro recreativo hoje mesmo.</Text>
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
                        title="Cadastrar"
                        onPress={handleSignUp}
                        loading={loading}
                        icon="arrow-right"
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
        marginBottom: Theme.spacing.xl,
        alignItems: 'center',
    },
    title: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        fontSize: 36,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        textAlign: 'center',
        marginTop: Theme.spacing.xs,
        lineHeight: 22,
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
