import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Linking,
    ScrollView,
    Image,
    Pressable
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';

interface ParentSettingsModalProps {
    isVisible: boolean;
    onClose: () => void;
    sectionId: string;
    sectionTitle: string;
    user: {
        id: string;
        email: { value: string };
    } | null;
}

interface ChildItem {
    id: string;
    name: string;
    photoUrl?: string;
    className: string;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
    isVisible,
    onClose,
    sectionId,
    sectionTitle,
    user
}) => {
    const { colors, activeTheme } = useTheme();
    const spacing = activeTheme.spacing;
    const styles = createStyles(colors, spacing);

    // States for linked children
    const [childrenList, setChildrenList] = useState<ChildItem[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);

    // States for notifications toggles
    const [notifyAttendance, setNotifyAttendance] = useState(true);
    const [notifyPhotos, setNotifyPhotos] = useState(true);
    const [notifyNotices, setNotifyNotices] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!isVisible || sectionId !== '2' || !user?.id) return;

            setLoadingChildren(true);
            setChildrenError(null);
            try {
                const guardianRepo = new SupabaseGuardianRepository();
                const guardian = await guardianRepo.findByUserId(user.id);
                if (guardian) {
                    const childRepo = new SupabaseChildRepository();
                    const children = await childRepo.findByGuardianId(guardian.id);
                    
                    const classRepo = new SupabaseClassRepository();
                    const childrenWithClasses = await Promise.all(
                        children.map(async (child) => {
                            let className = 'Sem turma vinculada';
                            if (child.classId) {
                                const cls = await classRepo.findById(child.classId);
                                if (cls) {
                                    className = cls.name;
                                }
                            }
                            return {
                                id: child.id,
                                name: child.name.value,
                                photoUrl: child.photoUrl,
                                className
                            };
                        })
                    );
                    setChildrenList(childrenWithClasses);
                } else {
                    setChildrenError('Perfil do responsável não encontrado.');
                }
            } catch (err) {
                console.error('Failed to load children linked data', err);
                setChildrenError('Não foi possível carregar a lista de filhos vinculados.');
            } finally {
                setLoadingChildren(false);
            }
        };

        fetchChildren();
    }, [isVisible, sectionId, user?.id]);

    const handleSendEmail = () => {
        Linking.openURL('mailto:suporte@bambole.edu.br?subject=Suporte Bambolê App');
    };

    const handleCallPhone = () => {
        Linking.openURL('tel:1140028922');
    };

    const renderContent = () => {
        switch (sectionId) {
            case '1': // Dados Pessoais
                return (
                    <View style={styles.panelContainer}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                                <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>E-mail</Text>
                                <Text style={styles.infoValue}>{user?.email?.value || ''}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBadge, { backgroundColor: '#10B98115' }]}>
                                <MaterialCommunityIcons name="shield-account-outline" size={20} color="#10B981" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Cargo</Text>
                                <Text style={styles.infoValue}>Responsável (Pai/Mãe)</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBadge, { backgroundColor: '#F59E0B15' }]}>
                                <MaterialCommunityIcons name="identifier" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>ID do Usuário</Text>
                                <Text style={styles.infoValue}>{user?.id || ''}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBadge, { backgroundColor: '#6366F115' }]}>
                                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#6366F1" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Status da Conta</Text>
                                <Text style={styles.infoValue}>Ativa</Text>
                            </View>
                        </View>
                    </View>
                );

            case '2': // Filhos Vinculados
                if (loadingChildren) {
                    return (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Carregando filhos vinculados...</Text>
                        </View>
                    );
                }

                if (childrenError) {
                    return (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
                            <Text style={styles.errorText}>{childrenError}</Text>
                        </View>
                    );
                }

                if (childrenList.length === 0) {
                    return (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-child-outline" size={64} color={colors.gray[300]} />
                            <Text style={styles.emptyText}>Nenhum filho foi vinculado a este perfil.</Text>
                            <Text style={styles.emptySubtext}>Entre em contato com a secretaria para realizar o vínculo.</Text>
                        </View>
                    );
                }

                return (
                    <View style={styles.panelContainer}>
                        {childrenList.map((child) => (
                            <View key={child.id} style={styles.childCard}>
                                <View style={styles.childAvatarContainer}>
                                    {child.photoUrl ? (
                                        <Image source={{ uri: child.photoUrl }} style={styles.childAvatar} />
                                    ) : (
                                        <MaterialCommunityIcons name="face-man-profile" size={30} color={colors.gray[400]} />
                                    )}
                                </View>
                                <View style={styles.childInfo}>
                                    <Text style={styles.childName}>{child.name}</Text>
                                    <View style={[styles.classBadge, { backgroundColor: `${colors.primary}10` }]}>
                                        <Text style={[styles.classBadgeText, { color: colors.primary }]}>{child.className}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                );

            case '3': // Notificações
                return (
                    <View style={styles.panelContainer}>
                        <Text style={styles.panelDescription}>
                            Selecione os alertas que deseja receber como notificação push em seu dispositivo:
                        </Text>
                        
                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={styles.switchTitle}>Presenças e Faltas</Text>
                                <Text style={styles.switchDesc}>Alertar assim que o monitor realizar a chamada.</Text>
                            </View>
                            <Switch
                                value={notifyAttendance}
                                onValueChange={setNotifyAttendance}
                                trackColor={{ false: colors.gray[200], true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={styles.switchTitle}>Fotos e Atividades</Text>
                                <Text style={styles.switchDesc}>Notificar novas postagens no feed de fotos da turma.</Text>
                            </View>
                            <Switch
                                value={notifyPhotos}
                                onValueChange={setNotifyPhotos}
                                trackColor={{ false: colors.gray[200], true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <View style={styles.switchInfo}>
                                <Text style={styles.switchTitle}>Avisos e Comunicados</Text>
                                <Text style={styles.switchDesc}>Mensagens urgentes enviadas pela secretaria/admin.</Text>
                            </View>
                            <Switch
                                value={notifyNotices}
                                onValueChange={setNotifyNotices}
                                trackColor={{ false: colors.gray[200], true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                );

            case '4': // Segurança
                return (
                    <View style={styles.panelContainer}>
                        <View style={styles.securityHeader}>
                            <MaterialCommunityIcons name="shield-check" size={56} color="#10B981" />
                            <Text style={styles.securityTitle}>Acesso Protegido</Text>
                            <Text style={styles.securitySubtitle}>Sua conta e seus dados estão protegidos</Text>
                        </View>

                        <View style={styles.securityCard}>
                            <View style={[styles.securityIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                                <MaterialCommunityIcons name="key-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={styles.securityCardText}>
                                <Text style={styles.securityCardTitle}>Tokens Criptografados</Text>
                                <Text style={styles.securityCardDesc}>O acesso está protegido por token seguro de autenticação direta com o backend Supabase.</Text>
                            </View>
                        </View>

                        <View style={styles.securityCard}>
                            <View style={[styles.securityIconContainer, { backgroundColor: '#F59E0B15' }]}>
                                <MaterialCommunityIcons name="lock-reset" size={22} color="#F59E0B" />
                            </View>
                            <View style={styles.securityCardText}>
                                <Text style={styles.securityCardTitle}>Alterar de Senha</Text>
                                <Text style={styles.securityCardDesc}>Para redefinir ou alterar sua senha, utilize a opção correspondente na tela de login do aplicativo.</Text>
                            </View>
                        </View>
                    </View>
                );

            case '5': // Central de Ajuda
                return (
                    <View style={styles.panelContainer}>
                        <Text style={styles.panelDescription}>
                            Tem alguma dúvida, crítica ou sugestão? Entre em contato diretamente com o Colégio Bambolê:
                        </Text>

                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleSendEmail}>
                            <View style={[styles.actionCardIcon, { backgroundColor: `${colors.primary}15` }]}>
                                <MaterialCommunityIcons name="email-outline" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.actionCardInfo}>
                                <Text style={styles.actionCardTitle}>Enviar E-mail</Text>
                                <Text style={styles.actionCardDesc}>suporte@bambole.edu.br</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray[400]} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleCallPhone}>
                            <View style={[styles.actionCardIcon, { backgroundColor: '#10B98115' }]}>
                                <MaterialCommunityIcons name="phone-outline" size={24} color="#10B981" />
                            </View>
                            <View style={styles.actionCardInfo}>
                                <Text style={styles.actionCardTitle}>Ligar Agora</Text>
                                <Text style={styles.actionCardDesc}>(11) 4002-8922</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray[400]} />
                        </TouchableOpacity>

                        <View style={styles.helpNote}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.gray[500]} />
                            <Text style={styles.helpNoteText}>Atendimento da secretaria: Segunda a Sexta, das 8h às 18h.</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.dismissArea} onPress={onClose} />
                <View style={styles.sheetContainer}>
                    <View style={styles.dragIndicator} />
                    
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{sectionTitle}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={22} color={colors.onBackground} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {renderContent()}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any, spacing: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheetContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    dragIndicator: {
        width: 38,
        height: 5,
        backgroundColor: colors.gray[300],
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.onBackground,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    panelContainer: {
        width: '100%',
    },
    panelDescription: {
        fontSize: 14,
        color: colors.gray[500],
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    // Personal Data Styles
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[100],
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.gray[500],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onBackground,
        marginTop: 2,
    },
    // Children Styles
    loadingContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.gray[500],
    },
    errorContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.error,
        textAlign: 'center',
    },
    emptyContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onBackground,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 13,
        color: colors.gray[500],
        marginTop: 6,
        textAlign: 'center',
    },
    childCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[100],
    },
    childAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    childAvatar: {
        width: '100%',
        height: '100%',
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.onBackground,
    },
    classBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 4,
    },
    classBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    // Notification Styles
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
    },
    switchInfo: {
        flex: 1,
        paddingRight: spacing.md,
    },
    switchTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onBackground,
    },
    switchDesc: {
        fontSize: 12,
        color: colors.gray[500],
        marginTop: 2,
    },
    // Security Styles
    securityHeader: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    securityTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.onBackground,
        marginTop: 12,
    },
    securitySubtitle: {
        fontSize: 13,
        color: colors.gray[500],
        marginTop: 4,
    },
    securityCard: {
        flexDirection: 'row',
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[100],
        alignItems: 'center',
    },
    securityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    securityCardText: {
        flex: 1,
    },
    securityCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.onBackground,
    },
    securityCardDesc: {
        fontSize: 12,
        color: colors.gray[500],
        marginTop: 2,
        lineHeight: 16,
    },
    // Help Center Styles
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray[100],
    },
    actionCardIcon: {
        width: 46,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    actionCardInfo: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.onBackground,
    },
    actionCardDesc: {
        fontSize: 13,
        color: colors.gray[500],
        marginTop: 2,
    },
    helpNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    helpNoteText: {
        fontSize: 12,
        color: colors.gray[500],
        marginLeft: 6,
    },
});
