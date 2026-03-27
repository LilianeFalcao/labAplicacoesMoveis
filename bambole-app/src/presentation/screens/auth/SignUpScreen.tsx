import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Input, PrimaryButton } from '@/presentation/components/common/UI';
import { useNavigation } from '@react-navigation/native';

export const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

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
            // Em breve: useCase.execute(...)
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nova Conta</Text>
            <Text style={styles.subtitle}>Cadastre-se para acompanhar seu filho</Text>

            <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Input
                label="Confirmar Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <View style={styles.spacer} />
            <PrimaryButton title="Cadastrar" onPress={handleSignUp} loading={loading} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 25, backgroundColor: '#FFF' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
    spacer: { height: 20 }
});
