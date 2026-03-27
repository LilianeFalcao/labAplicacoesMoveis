import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Alert, ScrollView } from 'react-native';
import { PrimaryButton } from '../../components/common/UI';
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

            Alert.alert('Sucesso', 'Aviso enviado e pais notificados!');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao enviar aviso.');
        } finally {
            setSending(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Conteúdo do Aviso</Text>
            <TextInput
                style={styles.input}
                multiline
                numberOfLines={6}
                placeholder="Digite a mensagem para os pais..."
                value={content}
                onChangeText={setContent}
            />

            <View style={styles.row}>
                <Text style={styles.label}>Enviar para todos os pais?</Text>
                <Switch value={isGeneral} onValueChange={setIsGeneral} />
            </View>

            {!isGeneral && (
                <>
                    <Text style={styles.label}>ID da Turma</Text>
                    <TextInput
                        style={styles.inputSmall}
                        placeholder="Ex: TURMA_A"
                        value={classId}
                        onChangeText={setClassId}
                    />
                </>
            )}

            <View style={styles.footer}>
                <PrimaryButton
                    title={sending ? "Enviando..." : "Disparar Aviso"}
                    onPress={handleSend}
                    disabled={sending}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#2D3436', marginBottom: 10, marginTop: 15 },
    input: {
        backgroundColor: '#FFF', borderRadius: 12, padding: 15, fontSize: 16,
        color: '#2D3436', textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E0E0'
    },
    inputSmall: {
        backgroundColor: '#FFF', borderRadius: 10, padding: 12, fontSize: 16,
        color: '#2D3436', borderWidth: 1, borderColor: '#E0E0E0'
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    footer: { marginTop: 30 }
});
