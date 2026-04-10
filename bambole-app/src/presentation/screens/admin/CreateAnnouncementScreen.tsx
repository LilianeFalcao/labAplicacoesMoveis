import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SendAnnouncementUseCase } from '@/application/communication/use-cases/SendAnnouncementUseCase';
import { SupabaseAnnouncementRepository } from '@/infrastructure/communication/repositories/SupabaseAnnouncementRepository';
import { SupabaseUserRepository } from '@/infrastructure/identity/repositories/SupabaseUserRepository';
import { ExpoPushService } from '@/infrastructure/notifications/ExpoPushService';

export const CreateAnnouncementScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
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
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Novo Comunicado Oficial"
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSection}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="bullhorn-variant-outline" size={40} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.headerTitle}>Comunicado Geral</Text>
                        <Text style={styles.headerSubtitle}>Este aviso será enviado como notificação PUSH para todos os responsáveis selecionados.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputLabelRow}>
                            <Text style={styles.label}>Mensagem do Comunicado</Text>
                            <Text style={styles.charCount}>{content.length}/500</Text>
                        </View>
                        <View style={styles.contentContainer}>
                            <TextInput
                                style={styles.contentInput}
                                multiline
                                placeholder="Digite aqui a mensagem oficial da escola..."
                                placeholderTextColor={Theme.colors.gray[400]}
                                value={content}
                                onChangeText={setContent}
                                maxLength={500}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.configCard}>
                            <View style={styles.switchRow}>
                                <View style={styles.switchInfo}>
                                    <View style={styles.switchTitleRow}>
                                        <MaterialCommunityIcons name="earth" size={18} color={Theme.colors.gray[600]} />
                                        <Text style={styles.switchLabel}>Enviar para toda a escola?</Text>
                                    </View>
                                    <Text style={styles.switchSublabel}>Se desativado, você poderá escolher uma turma específica.</Text>
                                </View>
                                <Switch
                                    value={isGeneral}
                                    onValueChange={setIsGeneral}
                                    trackColor={{ false: Theme.colors.gray[200], true: Theme.colors.primary + '50' }}
                                    thumbColor={isGeneral ? Theme.colors.primary : Theme.colors.gray[400]}
                                />
                            </View>

                            {!isGeneral && (
                                <View style={styles.turmaSection}>
                                    <View style={styles.divider} />
                                    <Text style={styles.innerLabel}>Identificador da Turma</Text>
                                    <View style={styles.idInputContainer}>
                                        <MaterialCommunityIcons name="door-open" size={18} color={Theme.colors.gray[400]} />
                                        <TextInput
                                            style={styles.idInput}
                                            placeholder="Ex: TURMA_A"
                                            placeholderTextColor={Theme.colors.gray[400]}
                                            value={classId}
                                            onChangeText={setClassId}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.warningBox}>
                            <MaterialCommunityIcons name="alert-decagram-outline" size={20} color="#D97706" />
                            <Text style={styles.warningText}>Esta ação não pode ser desfeita após o envio das notificações.</Text>
                        </View>

                        <AppButton
                            title="Disparar Comunicado Agora"
                            onPress={handleSend}
                            loading={sending}
                            style={styles.button}
                            variant="primary"
                        />

                        <TouchableOpacity style={styles.draftBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.draftBtnText}>Cancelar e Descartar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: Theme.spacing.lg,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    headerTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    headerSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: Theme.spacing.xl,
    },
    form: {
        flex: 1,
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: Theme.spacing.md,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    charCount: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    contentContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        minHeight: 160,
    },
    contentInput: {
        padding: Theme.spacing.md,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        flex: 1,
    },
    configCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        marginTop: Theme.spacing.lg,
        padding: Theme.spacing.md,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchInfo: {
        flex: 1,
        paddingRight: Theme.spacing.md,
    },
    switchTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    switchLabel: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    switchSublabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    turmaSection: {
        marginTop: Theme.spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.gray[100],
        marginBottom: Theme.spacing.md,
    },
    innerLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
        fontWeight: 'bold',
        marginBottom: 8,
    },
    idInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: Theme.spacing.md,
        height: 44,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        gap: 8,
    },
    idInput: {
        flex: 1,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        fontWeight: 'bold',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: Theme.spacing.md,
        borderRadius: 12,
        marginTop: Theme.spacing.xl,
        gap: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    warningText: {
        ...Theme.typography.caption,
        color: '#92400E',
        fontWeight: '600',
        flex: 1,
    },
    button: {
        marginTop: Theme.spacing.xl,
        height: 56,
    },
    draftBtn: {
        alignItems: 'center',
        marginTop: Theme.spacing.lg,
    },
    draftBtnText: {
        ...Theme.typography.body2,
        color: Theme.colors.error,
        fontWeight: 'bold',
    },
});
