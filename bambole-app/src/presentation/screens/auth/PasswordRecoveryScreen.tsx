import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const handleRecovery = async () => {
        if (!email) {
            Alert.alert('Erro', 'Informe seu e-mail');
            return;
        }

        setLoading(true);
        try {
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recuperar Senha</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.container}>
                <View style={styles.intro}>
                    <Text style={styles.title}>Esqueceu a senha?</Text>
                    <Text style={styles.subtitle}>Não se preocupe! Informe seu e-mail abaixo para receber um link de recuperação.</Text>
                </View>

                <AppInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="Ex: joao@email.com"
                    autoCapitalize="none"
                />

                <AppButton
                    title="Enviar Recuperação"
                    onPress={handleRecovery}
                    loading={loading}
                    style={styles.button}
                />
            </View>
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
    container: {
        flex: 1,
        padding: Theme.spacing.lg,
        paddingTop: Theme.spacing.xl,
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
    button: {
        marginTop: Theme.spacing.lg,
    },
});
