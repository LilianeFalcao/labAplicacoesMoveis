import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
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
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Criar Conta</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.intro}>
                    <Text style={styles.title}>Bem-vindo!</Text>
                    <Text style={styles.subtitle}>Cadastre-se para acompanhar seu filho no Bambolê.</Text>
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
                        placeholder="Minimo 8 caracteres"
                    />
                    <AppInput
                        label="Confirmar Senha"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Repita sua senha"
                    />

                    <AppButton
                        title="Finalizar Cadastro"
                        onPress={handleSignUp}
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Já possui uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.link}>Entrar</Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
        height: 56,
    },
    backButton: {
        padding: Theme.spacing.sm,
    },
    headerTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Theme.spacing.lg,
    },
    intro: {
        marginBottom: Theme.spacing.xl,
    },
    title: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    subtitle: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
        marginTop: Theme.spacing.xs,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: Theme.spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Theme.spacing.xxl,
        paddingBottom: Theme.spacing.lg,
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
