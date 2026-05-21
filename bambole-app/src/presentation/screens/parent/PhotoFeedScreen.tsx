import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/base/AppCard';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { GetGuardianConsentUseCase } from '../../../application/enrollment/use-cases/GetGuardianConsentUseCase';
import { UpdateGuardianConsentUseCase } from '../../../application/enrollment/use-cases/UpdateGuardianConsentUseCase';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Theme.spacing.lg * 2 - Theme.spacing.md) / 2;

export const PhotoFeedScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [hasConsent, setHasConsent] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    const guardianRepo = new SupabaseGuardianRepository();
    const getConsentUseCase = new GetGuardianConsentUseCase(guardianRepo);
    const updateConsentUseCase = new UpdateGuardianConsentUseCase(guardianRepo);

    // Mock data for the gallery (displayed only when consent is granted)
    const photoData = [
        { id: '1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=500', date: '31 de Março', activity: 'Futebol' },
        { id: '2', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=500', date: '31 de Março', activity: 'Artes' },
        { id: '3', url: 'https://images.unsplash.com/photo-1540479859204-7cd3b0928f64?q=80&w=500', date: '30 de Março', activity: 'Dança' },
        { id: '4', url: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=500', date: '30 de Março', activity: 'Leitura' },
        { id: '5', url: 'https://images.unsplash.com/photo-1564424224827-cd24b8915874?q=80&w=500', date: '29 de Março', activity: 'Fevereiro' },
        { id: '6', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=500', date: '29 de Março', activity: 'Parque' },
    ];

    const checkConsent = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const consent = await getConsentUseCase.execute(user.id);
            setHasConsent(consent);
        } catch (error) {
            console.error('Failed to get guardian consent', error);
            setHasConsent(false);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        checkConsent();
    }, [checkConsent]);

    const handleAcceptConsent = async () => {
        if (!user) return;
        if (!termsAccepted) {
            Alert.alert('Aviso', 'Por favor, assinale o termo para autorizar o uso das imagens.');
            return;
        }

        setUpdating(true);
        try {
            await updateConsentUseCase.execute(user.id, true);
            setHasConsent(true);
            Alert.alert('Sucesso', 'Seu consentimento foi registrado. Galeria liberada!');
        } catch (error: any) {
            console.error('Failed to update consent', error);
            Alert.alert('Erro', 'Não foi possível registrar o termo de consentimento.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Carregando preferências...</Text>
            </View>
        );
    }

    if (hasConsent === false) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                    <Text style={styles.headerTitle}>Fotos da Turma</Text>
                </View>

                <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentConsent}>
                    <AppCard style={styles.consentCard}>
                        <View style={styles.shieldIconContainer}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={48} color={Theme.colors.primary} />
                        </View>

                        <Text style={styles.consentTitle}>Termo de Consentimento de Uso de Imagem</Text>
                        
                        <Text style={styles.consentSubtitle}>
                            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), precisamos da sua autorização expressa para exibir as fotos do dia a dia escolar do seu filho.
                        </Text>

                        <View style={styles.legalInfoBox}>
                            <View style={styles.legalRow}>
                                <MaterialCommunityIcons name="check-decagram" size={20} color="#059669" />
                                <Text style={styles.legalText}>
                                    <Text style={{ fontWeight: 'bold' }}>Segurança Total:</Text> As imagens ficam restritas a este aplicativo seguro.
                                </Text>
                            </View>
                            
                            <View style={styles.legalRow}>
                                <MaterialCommunityIcons name="school" size={20} color="#059669" />
                                <Text style={styles.legalText}>
                                    <Text style={{ fontWeight: 'bold' }}>Finalidade:</Text> Registros puramente didáticos, pedagógicos e de comemorações.
                                </Text>
                            </View>

                            <View style={styles.legalRow}>
                                <MaterialCommunityIcons name="cancel" size={20} color="#059669" />
                                <Text style={styles.legalText}>
                                    <Text style={{ fontWeight: 'bold' }}>Sem Comercialização:</Text> Fotos nunca serão expostas ao público ou terceiros.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.switchContainer}>
                            <Switch
                                value={termsAccepted}
                                onValueChange={setTermsAccepted}
                                trackColor={{ false: '#CBD5E1', true: Theme.colors.primary + '80' }}
                                thumbColor={termsAccepted ? Theme.colors.primary : '#F1F5F9'}
                            />
                            <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} activeOpacity={0.8} style={{ flex: 1 }}>
                                <Text style={styles.switchLabel}>
                                    Declaro que li e concordo com os termos descritos acima, autorizando a exibição das fotografias.
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.acceptButton, !termsAccepted && styles.disabledButton]}
                            onPress={handleAcceptConsent}
                            disabled={updating || !termsAccepted}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="check-all" size={20} color="#FFFFFF" />
                                    <Text style={styles.acceptButtonText}>Autorizar e Acessar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </AppCard>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Fotos da Turma</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.title}>Galeria</Text>
                    <Text style={styles.subtitle}>Veja os melhores momentos das atividades.</Text>
                </View>

                <View style={styles.categoryRow}>
                    <TouchableOpacity style={[styles.categoryChip, styles.activeChip]}>
                        <Text style={[styles.categoryText, styles.activeCategoryText]}>Tudo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Futebol</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Dança</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Eventos</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.photoGrid}>
                    {photoData.map((item) => (
                        <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.photoItem}>
                            <AppCard style={styles.photoCard}>
                                <Image source={{ uri: item.url }} style={styles.photoImage} />
                                <View style={styles.photoOverlay}>
                                    <Text style={styles.photoDate}>{item.date}</Text>
                                    <Text style={styles.photoActivity}>{item.activity}</Text>
                                </View>
                            </AppCard>
                        </TouchableOpacity>
                    ))}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    filterButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    scrollContentConsent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xl,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
        gap: Theme.spacing.md,
    },
    loadingText: {
        fontSize: 14,
        color: Theme.colors.gray[500],
        fontWeight: '500',
    },
    welcomeSection: {
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.lg,
    },
    title: {
        ...Theme.typography.h1,
        fontSize: 28,
        color: Theme.colors.onBackground,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginTop: 4,
    },
    categoryRow: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.xl,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
    },
    activeChip: {
        backgroundColor: Theme.colors.primary,
    },
    categoryText: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.gray[600],
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    photoItem: {
        width: COLUMN_WIDTH,
        marginBottom: Theme.spacing.md,
    },
    photoCard: {
        padding: 0,
        borderRadius: 20,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#E2E8F0',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    photoDate: {
        ...Theme.typography.caption,
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    photoActivity: {
        ...Theme.typography.caption,
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    // Consent Styles
    consentCard: {
        padding: Theme.spacing.xl,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
    },
    shieldIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    consentTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.onSurface,
        textAlign: 'center',
        marginBottom: Theme.spacing.md,
        lineHeight: 26,
    },
    consentSubtitle: {
        fontSize: 14,
        color: Theme.colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Theme.spacing.xl,
    },
    legalInfoBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: Theme.spacing.lg,
        gap: 16,
        marginBottom: Theme.spacing.xl,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    legalRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    legalText: {
        flex: 1,
        fontSize: 13,
        color: Theme.colors.gray[700],
        lineHeight: 18,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: Theme.spacing.xl,
        paddingHorizontal: 4,
    },
    switchLabel: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        lineHeight: 18,
        fontWeight: '500',
    },
    acceptButton: {
        width: '100%',
        height: 52,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: Theme.colors.gray[300],
        shadowOpacity: 0,
        elevation: 0,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
