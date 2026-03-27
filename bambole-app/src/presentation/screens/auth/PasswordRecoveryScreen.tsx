import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input, PrimaryButton } from '@/presentation/components/common/UI';
import { useNavigation } from '@react-navigation/native';

export const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleRecovery = async () => {
        if (!email) {
            Alert.alert('Erro', 'Informe seu e-mail');
            return;
        }

        setLoading(true);
        try {
            // Em breve: authService.resetPassword(...)
            Alert.alert('E-mail enviado', 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>Enviaremos um link para o seu e-mail</Text>

            <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <View style={styles.spacer} />
            <PrimaryButton title="Enviar Link" onPress={handleRecovery} loading={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, backgroundColor: '#FFF', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
    spacer: { height: 20 }
});
