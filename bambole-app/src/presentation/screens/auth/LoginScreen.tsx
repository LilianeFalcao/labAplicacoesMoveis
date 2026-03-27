import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { Input, PrimaryButton } from '@/presentation/components/common/UI';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            // Temporário: No futuro chamará o SignInUseCase
            // Por enquanto simulamos sucesso como pai para teste de navegação
            signIn('parent');
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Bambolê</Text>
            <Text style={styles.subtitle}>Gestão escolar simplificada</Text>

            <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Ex: joao@email.com"
            />
            <Input
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
            />

            <PrimaryButton title="Acessar" onPress={handleLogin} loading={loading} />

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.link}>Criar Conta</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Recovery')}>
                    <Text style={styles.link}>Esqueci a senha</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, justifyContent: 'center', backgroundColor: '#FFF' },
    logo: { fontSize: 42, fontWeight: 'bold', color: '#E91E63', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    link: { color: '#E91E63', fontWeight: 'bold' }
});
