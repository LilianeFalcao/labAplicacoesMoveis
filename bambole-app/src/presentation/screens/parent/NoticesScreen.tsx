import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/base/AppCard';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseAnnouncementRepository } from '../../../infrastructure/communication/repositories/SupabaseAnnouncementRepository';

export const NoticesScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [notices, setNotices] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fallbackNotices = [
        {
            id: '1',
            title: 'Uniforme de natação obrigatório',
            content: 'Lembramos a todos os pais que amanhã teremos aula de natação. O uso do uniforme completo é obrigatório para a participação.',
            date: 'HOJE, 09:30',
            type: 'alert',
            icon: 'bullhorn-variant',
            tag: 'TURMA A'
        },
        {
            id: '2',
            title: 'Reunião de pais e mestres',
            content: 'Neste sábado teremos nossa reunião trimestral para entrega de boletins e conversa com os professores. Sua presença é fundamental.',
            date: 'ONTEM, 14:00',
            type: 'info',
            icon: 'calendar-text',
            tag: 'ESCOLA'
        },
        {
            id: '3',
            title: 'Feriado de Páscoa',
            content: 'Informamos que não haverá aula nos dias 10 e 11 de abril devido ao feriado de Páscoa. Retornaremos normalmente na segunda-feira.',
            date: '28 MAR, 08:15',
            type: 'info',
            icon: 'clock-outline',
            tag: 'ESCOLA'
        },
    ];

    const loadNotices = React.useCallback(async () => {
        setLoading(true);
        try {
            let classIds: string[] = [];
            if (user?.id) {
                const guardianRepo = new SupabaseGuardianRepository();
                const guardian = await guardianRepo.findByUserId(user.id);
                if (guardian) {
                    const childRepo = new SupabaseChildRepository();
                    const children = await childRepo.findByGuardianId(guardian.id);
                    classIds = children.map(c => c.classId).filter((id): id is string => !!id);
                }
            }

            const annRepo = new SupabaseAnnouncementRepository();
            const announcements = await annRepo.findRelevantForClasses(classIds);

            if (announcements.length === 0) {
                setNotices([]);
                return;
            }

            const mapped = announcements.map(ann => {
                const dateObj = ann.publishedAt;
                const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase();
                
                const fullText = ann.content.value || '';
                const parts = fullText.split('\n');
                const titleText = parts[0] || 'Comunicado';
                const contentText = parts.slice(1).join('\n') || fullText;

                const isGeneral = ann.audience.type === 'all';

                return {
                    id: ann.id,
                    title: titleText.length > 50 ? titleText.substring(0, 50) + '...' : titleText,
                    content: contentText,
                    date: formattedDate,
                    type: isGeneral ? 'info' : 'alert',
                    icon: isGeneral ? 'bullhorn-variant' : 'school',
                    tag: isGeneral ? 'ESCOLA' : 'TURMA'
                };
            });

            setNotices(mapped);
        } catch (error) {
            console.error("Failed to load notices", error);
            setNotices(fallbackNotices);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    React.useEffect(() => {
        loadNotices();
    }, [loadNotices]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Avisos</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <MaterialCommunityIcons name="magnify" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.title}>Comunicados</Text>
                    <Text style={styles.subtitle}>Fique por dentro das novidades da escola.</Text>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                        <ActivityIndicator size="large" color={Theme.colors.primary} />
                    </View>
                ) : notices.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                        <MaterialCommunityIcons name="bell-off-outline" size={48} color={Theme.colors.gray[300]} />
                        <Text style={{ marginTop: 16, color: Theme.colors.gray[400], ...Theme.typography.body2 }}>Nenhum comunicado no momento.</Text>
                    </View>
                ) : (
                    notices.map((item) => (
                        <AppCard key={item.id} style={styles.noticeCard}>
                            <View style={styles.noticeHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: item.type === 'alert' ? '#FFEDD5' : '#DBEAFE' }]}>
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={24}
                                        color={item.type === 'alert' ? '#92400E' : '#1E40AF'}
                                    />
                                </View>
                                <View style={styles.headerContent}>
                                    <View style={styles.tagRow}>
                                        <Text style={[styles.tag, { color: item.type === 'alert' ? '#92400E' : '#1E40AF' }]}>{item.tag}</Text>
                                        <Text style={styles.dot}> • </Text>
                                        <Text style={styles.date}>{item.date}</Text>
                                    </View>
                                    <Text style={styles.noticeTitle}>{item.title}</Text>
                                </View>
                            </View>
                            <Text style={styles.noticeContent}>{item.content}</Text>
                            <TouchableOpacity 
                                style={styles.readMore}
                                onPress={() => Alert.alert(item.title, item.content)}
                            >
                                <Text style={styles.readMoreText}>Ler comunicado completo</Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={Theme.colors.primary} />
                            </TouchableOpacity>
                        </AppCard>
                    ))
                )}
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
    searchButton: {
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
    welcomeSection: {
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
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
    noticeCard: {
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerContent: {
        flex: 1,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    tag: {
        ...Theme.typography.caption,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dot: {
        color: Theme.colors.gray[400],
    },
    date: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    noticeTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    noticeContent: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[700],
        lineHeight: 22,
        marginBottom: 16,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    readMoreText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: '700',
        marginRight: 4,
    },
});
