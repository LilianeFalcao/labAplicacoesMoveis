import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard } from '../../components/base/AppCard';

export const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

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
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
                <Text style={styles.headerLogo}>Bambolê</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="lock-reset" size={40} color={Theme.colors.onPrimary} />
                    </View>
                </View>

                <View style={styles.intro}>
                    <Text style={styles.title}>Recuperar Senha</Text>
                    <Text style={styles.subtitle}>Enviaremos um link de recuperação para seu e-mail.</Text>
                </View>

                <View style={styles.form}>
                    <AppInput
                        label="E-MAIL INSTITUCIONAL"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="nome@exemplo.com"
                        autoCapitalize="none"
                        rightIcon="at"
                    />

                    <AppButton
                        title="Enviar link"
                        onPress={handleRecovery}
                        loading={loading}
                        icon="send"
                        style={styles.button}
                    />
                </View>

                <View style={styles.supportContainer}>
                    <AppCard style={styles.supportCard}>
                        <MaterialCommunityIcons name="help-circle" size={24} color="#B45309" />
                        <Text style={styles.supportTitle}>Precisa de ajuda?</Text>
                    </AppCard>

                    <AppCard style={[styles.supportCard, { backgroundColor: '#DCFCE7' }]}>
                        <MaterialCommunityIcons name="headset" size={24} color="#15803D" />
                        <Text style={styles.supportTitle}>Falar com Monitor</Text>
                    </AppCard>
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
    iconContainer: {
        alignItems: 'center',
        marginTop: Theme.spacing.xxl,
        marginBottom: Theme.spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    intro: {
        marginBottom: Theme.spacing.xl,
    },
    title: {
        ...Theme.typography.h1,
        color: Theme.colors.onBackground,
        fontSize: 36,
    },
    subtitle: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
        marginTop: Theme.spacing.xs,
        lineHeight: 24,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: Theme.spacing.lg,
    },
    supportContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.xxl,
        paddingBottom: Theme.spacing.lg,
    },
    supportCard: {
        flex: 0.48,
        padding: Theme.spacing.md,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        height: 120,
        backgroundColor: '#FEF3C7', // Light orange for help card
    },
    supportTitle: {
        ...Theme.typography.body2,
        fontWeight: '800',
        color: Theme.colors.onBackground,
        marginTop: Theme.spacing.md,
    },
});
