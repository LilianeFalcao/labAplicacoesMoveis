import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Alert, ScrollView, SafeAreaView } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useAuth } from '../../contexts/AuthContext';
import { SendAnnouncementUseCase } from '@/application/communication/use-cases/SendAnnouncementUseCase';
import { SupabaseAnnouncementRepository } from '@/infrastructure/communication/repositories/SupabaseAnnouncementRepository';
import { SupabaseUserRepository } from '@/infrastructure/identity/repositories/SupabaseUserRepository';
import { ExpoPushService } from '@/infrastructure/notifications/ExpoPushService';

export const CreateAnnouncementScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isGeneral, setIsGeneral] = useState(true);
    const [classId, setClassId] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!content.trim()) return Alert.alert('Erro', 'O conteúdo não pode estar vazio.');
        if (!isGeneral && !classId) return Alert.alert('Erro', 'Selecione uma turma.');

        setSending(true);
        try {
            const useCase = new SendAnnouncementUseCase(
                new SupabaseAnnouncementRepository(),
                new SupabaseUserRepository(),
                new ExpoPushService()
            );

            await useCase.execute(
                user!.id,
                content,
                isGeneral ? 'all' : 'class',
                isGeneral ? undefined : classId
            );

            Alert.alert('Sucesso', 'Aviso enviado e pais notificados!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao enviar aviso.');
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Novo Aviso"
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.label}>Conteúdo do Aviso</Text>
                    <TextInput
                        style={styles.contentInput}
                        multiline
                        numberOfLines={6}
                        placeholder="Digite a mensagem para os pais..."
                        value={content}
                        onChangeText={setContent}
                    />

                    <View style={styles.switchRow}>
                        <View style={styles.switchText}>
                            <Text style={styles.switchLabel}>Enviar para todos os pais?</Text>
                            <Text style={styles.switchSublabel}>Se desativado, selecione uma turma abaixo.</Text>
                        </View>
                        <Switch
                            value={isGeneral}
                            onValueChange={setIsGeneral}
                            trackColor={{ false: Theme.colors.gray[300], true: Theme.colors.primary + '88' }}
                            thumbColor={isGeneral ? Theme.colors.primary : Theme.colors.gray[400]}
                        />
                    </View>

                    {!isGeneral && (
                        <View style={styles.turmaSection}>
                            <Text style={styles.label}>ID da Turma</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Ex: TURMA_A"
                                value={classId}
                                onChangeText={setClassId}
                            />
                        </View>
                    )}

                    <AppButton
                        title="Disparar Aviso"
                        onPress={handleSend}
                        loading={sending}
                        style={styles.button}
                    />
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
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    form: {
        flex: 1,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.xs,
        marginTop: Theme.spacing.md,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.roundness,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        minHeight: 180,
        textAlignVertical: 'top',
        ...Theme.typography.body2,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
        paddingVertical: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[200],
    },
    switchText: {
        flex: 1,
        paddingRight: Theme.spacing.md,
    },
    switchLabel: {
        ...Theme.typography.body1,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
    switchSublabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    turmaSection: {
        marginTop: Theme.spacing.md,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.roundness,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        ...Theme.typography.body1,
    },
    button: {
        marginTop: Theme.spacing.xxl,
    },
});
