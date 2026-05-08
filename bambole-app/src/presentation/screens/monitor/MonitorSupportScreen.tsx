import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const MonitorSupportScreen = () => {
    const handleContact = (type: 'whatsapp' | 'email') => {
        // Mock links
        const url = type === 'whatsapp' ? 'https://wa.me/5500000000000' : 'mailto:suporte@bambole.com';
        Linking.openURL(url).catch(() => alert('Não foi possível abrir o link.'));
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <AppHeader title="Suporte e Ajuda" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.hero}>
                    <MaterialCommunityIcons name="face-agent" size={80} color={Theme.colors.primary} />
                    <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
                    <Text style={styles.heroSubtitle}>Nossa equipe está disponível para auxiliar você em seu turno.</Text>
                </View>

                <Text style={styles.sectionTitle}>Canais de Contato</Text>
                <TouchableOpacity onPress={() => handleContact('whatsapp')}>
                    <AppCard style={styles.contactCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="whatsapp" size={24} color="#16A34A" />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>WhatsApp de Emergência</Text>
                            <Text style={styles.cardValue}>Resposta em tempo real</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.gray[300]} />
                    </AppCard>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleContact('email')}>
                    <AppCard style={styles.contactCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                            <MaterialCommunityIcons name="email-outline" size={24} color={Theme.colors.primary} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardLabel}>E-mail de Suporte Técnico</Text>
                            <Text style={styles.cardValue}>Dúvidas sobre o aplicativo</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.gray[300]} />
                    </AppCard>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
                <AppCard style={styles.faqCard}>
                    <FaqItem 
                        question="Não consigo registrar presença" 
                        answer="Verifique se o seu GPS está ativado e se você está dentro do raio da unidade." 
                    />
                    <FaqItem 
                        question="Minha turma não aparece na lista" 
                        answer="Entre em contato com o administrador para verificar sua escala de hoje." 
                    />
                    <FaqItem 
                        question="Problemas com a câmera" 
                        answer="Certifique-se de que o aplicativo tem permissão para acessar a câmera nas configurações do celular." 
                    />
                </AppCard>
            </ScrollView>
        </SafeAreaView>
    );
};

const FaqItem = ({ question, answer }: any) => (
    <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    heroTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
        marginTop: 16,
    },
    heroSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 12,
        marginLeft: 4,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardLabel: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    cardValue: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    faqCard: {
        padding: 16,
    },
    faqItem: {
        marginBottom: 20,
    },
    faqQuestion: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    faqAnswer: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        lineHeight: 20,
    },
});
