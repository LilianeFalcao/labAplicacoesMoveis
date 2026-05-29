import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    TextInput, 
    Modal, 
    KeyboardAvoidingView, 
    Platform, 
    RefreshControl,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParentStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityCard } from '../../components/base/ActivityCard';
import { AppCard } from '../../components/base/AppCard';
import { AppButton } from '../../components/base/AppButton';

// Repositories and Use Case
import { SupabaseChildRepository } from '@/infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseAttendanceRepository } from '@/infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { SupabaseAgendaRepository } from '@/infrastructure/activity/repositories/SupabaseAgendaRepository';
import { SupabaseClassRepository } from '@/infrastructure/activity/repositories/SupabaseClassRepository';
import { JustifyAbsenceUseCase } from '@/application/attendance/use-cases/JustifyAbsenceUseCase';

type ChildDetailsRouteProp = RouteProp<ParentStackParamList, 'ChildDetails'>;
type ChildDetailsNavigationProp = StackNavigationProp<ParentStackParamList, 'ChildDetails'>;

export const ChildDetailsScreen = () => {
    const navigation = useNavigation<ChildDetailsNavigationProp>();
    const route = useRoute<ChildDetailsRouteProp>();
    const insets = useSafeAreaInsets();
    const { childId, childName: initialChildName = 'Aluno' } = route.params;

    const [child, setChild] = useState<any | null>(null);
    const [className, setClassName] = useState<string>('Carregando...');
    const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [stats, setStats] = useState({
        frequency: '100%',
        presences: 0,
        absences: 0,
        justifications: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Justification Modal state
    const [justificationModalVisible, setJustificationModalVisible] = useState(false);
    const [justificationReason, setJustificationReason] = useState('');
    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
    const [justificationSubmitting, setJustificationSubmitting] = useState(false);

    // Services
    const childRepo = new SupabaseChildRepository();
    const attendanceRepo = new SupabaseAttendanceRepository();
    const agendaRepo = SupabaseAgendaRepository.getInstance();
    const classRepo = new SupabaseClassRepository();
    const justifyAbsenceUseCase = new JustifyAbsenceUseCase(attendanceRepo, childRepo);

    const loadData = useCallback(async () => {
        if (!childId) return;
        try {
            // 1. Fetch Child
            const childData = await childRepo.findById(childId);
            setChild(childData);

            const classId = childData?.classId || '';

            // 2. Fetch Class Name
            if (classId) {
                const classObj = await classRepo.findById(classId);
                setClassName(classObj ? classObj.name : 'Turma Ativa');
            } else {
                setClassName('Sem Turma');
            }

            // 3. Fetch Today's Attendance
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = await attendanceRepo.findByChildAndDate(childId, todayStr);
            setTodayAttendance(todayRecord);

            // 4. Fetch Activities
            if (classId) {
                const classActivities = await agendaRepo.findByClass(classId);
                setActivities(classActivities);
            } else {
                setActivities([]);
            }

            // 5. Fetch Attendance History to calculate statistics
            const records = await attendanceRepo.findByChildId(childId);
            
            let presences = 0;
            let absences = 0;
            let justifications = 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            records.forEach(r => {
                const rDate = new Date(r.date);
                if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
                    if (r.status.value === 'present') {
                        presences++;
                    } else if (r.status.value === 'absent') {
                        absences++;
                    } else if (r.status.value === 'justified' || r.status.value === 'pre_justified') {
                        justifications++;
                    }
                }
            });

            const totalDays = presences + absences;
            const frequencyValue = totalDays > 0 ? Math.round((presences / totalDays) * 100) : 100;

            setStats({
                frequency: `${frequencyValue}%`,
                presences,
                absences,
                justifications
            });

        } catch (error) {
            console.error('Error loading child details:', error);
            Alert.alert('Erro', 'Não foi possível carregar todas as informações do aluno.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleOpenJustifyModal = (day: 'today' | 'tomorrow') => {
        setSelectedDay(day);
        setJustificationReason('');
        setJustificationModalVisible(true);
    };

    const handleConfirmJustification = async () => {
        if (!childId) return;
        if (!justificationReason.trim()) {
            Alert.alert('Aviso', 'Por favor, descreva o motivo da justificativa.');
            return;
        }

        try {
            setJustificationSubmitting(true);
            const targetDate = new Date();
            const isPreJustified = selectedDay === 'tomorrow';
            if (isPreJustified) {
                targetDate.setDate(targetDate.getDate() + 1);
            }

            await justifyAbsenceUseCase.execute(
                childId,
                targetDate,
                justificationReason.trim(),
                isPreJustified
            );

            Alert.alert('Sucesso', 'Justificativa salva com sucesso!');
            setJustificationModalVisible(false);
            setJustificationReason('');
            loadData();
        } catch (error) {
            console.error('Failed to submit justification', error);
            Alert.alert('Erro', 'Não foi possível registrar a justificativa no momento.');
        } finally {
            setJustificationSubmitting(false);
        }
    };

    const renderPresenceBanner = () => {
        const status = todayAttendance?.status?.value || 'pending';
        
        switch (status) {
            case 'present':
                const checkInTime = todayAttendance.date ? new Date(todayAttendance.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '14:15';
                return (
                    <View style={styles.presenceCard}>
                        <View style={styles.presenceIcon}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.presenceContent}>
                            <Text style={styles.presenceLabel}>PRESENÇA HOJE</Text>
                            <Text style={styles.presenceStatus}>Presente — <Text style={styles.presenceTime}>registrado às {checkInTime}</Text></Text>
                        </View>
                    </View>
                );
            case 'absent':
                return (
                    <View style={[styles.presenceCard, styles.presenceAbsentCard]}>
                        <View style={[styles.presenceIcon, styles.presenceAbsentIcon]}>
                            <MaterialCommunityIcons name="close-circle" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.presenceContent}>
                            <Text style={[styles.presenceLabel, styles.presenceAbsentLabel]}>FALTA REGISTRADA HOJE</Text>
                            <Text style={styles.presenceStatus}>Criança ausente hoje</Text>
                            <TouchableOpacity 
                                style={styles.justifyBadgeButton}
                                onPress={() => handleOpenJustifyModal('today')}
                            >
                                <MaterialCommunityIcons name="pencil-box-outline" size={14} color="#B91C1C" />
                                <Text style={styles.justifyBadgeText}>Enviar Justificativa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'pre_justified':
            case 'justified':
                const note = todayAttendance.justificationNote || 'Justificativa enviada';
                return (
                    <View style={[styles.presenceCard, styles.presenceJustifiedCard]}>
                        <View style={[styles.presenceIcon, styles.presenceJustifiedIcon]}>
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.presenceContent}>
                            <Text style={[styles.presenceLabel, styles.presenceJustifiedLabel]}>
                                {status === 'pre_justified' ? 'FALTA PREVISTA' : 'FALTA JUSTIFICADA'}
                            </Text>
                            <Text style={styles.presenceStatus} numberOfLines={2}>Motivo: "{note}"</Text>
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={[styles.presenceCard, styles.presencePendingCard]}>
                        <View style={[styles.presenceIcon, styles.presencePendingIcon]}>
                            <MaterialCommunityIcons name="calendar-question" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.presenceContent}>
                            <Text style={[styles.presenceLabel, styles.presencePendingLabel]}>CHAMADA NÃO INICIADA HOJE</Text>
                            <Text style={styles.presenceStatus}>Sem chamadas registradas hoje</Text>
                            <TouchableOpacity 
                                style={styles.preJustifyBadgeButton}
                                onPress={() => handleOpenJustifyModal('today')}
                            >
                                <MaterialCommunityIcons name="calendar-plus" size={14} color="#D97706" />
                                <Text style={styles.preJustifyBadgeText}>Prever Falta Hoje</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'sport': return 'soccer';
            case 'snack': return 'food-apple';
            case 'rest': return 'bed-outline';
            case 'art': return 'palette';
            default: return 'calendar';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'sport': return Theme.colors.primary;
            case 'snack': return '#10B981';
            case 'rest': return '#6366F1';
            case 'art': return '#EC4899';
            default: return Theme.colors.gray[600];
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bambolê</Text>
                <TouchableOpacity style={styles.notificationButton} onPress={() => Alert.alert('Avisos', 'Acesse a aba de avisos para comunicados completos.')}>
                    <MaterialCommunityIcons name="bell" size={24} color={Theme.colors.onBackground} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Theme.colors.primary]}
                        tintColor={Theme.colors.primary}
                    />
                }
            >
                {/* Cabeçalho do Perfil */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {child?.photoUrl ? (
                                <Image source={{ uri: child.photoUrl }} style={styles.avatarImage} />
                            ) : (
                                <MaterialCommunityIcons name="account" size={60} color={Theme.colors.onPrimary} />
                            )}
                        </View>
                        <View style={[
                            styles.statusBadgeDot, 
                            { 
                                backgroundColor: todayAttendance?.status?.value === 'present' ? '#059669' : 
                                                 todayAttendance?.status?.value === 'absent' ? '#EF4444' :
                                                 todayAttendance?.status?.value === 'pre_justified' || todayAttendance?.status?.value === 'justified' ? '#D97706' : '#94A3B8'
                            }
                        ]}>
                            <MaterialCommunityIcons 
                                name={todayAttendance?.status?.value === 'present' ? "emoticon-happy" : 
                                      todayAttendance?.status?.value === 'absent' ? "emoticon-sad" : "emoticon-neutral"} 
                                size={14} 
                                color="#FFFFFF" 
                            />
                        </View>
                    </View>
                    <Text style={styles.name}>{child?.name?.value || initialChildName}</Text>
                    <View style={styles.classInfo}>
                        <MaterialCommunityIcons name="school-outline" size={16} color={Theme.colors.primary} />
                        <Text style={styles.classText}>Turma {className}</Text>
                    </View>
                </View>

                {/* Banner de Presença */}
                <View style={styles.section}>
                    {renderPresenceBanner()}
                </View>

                {/* Botão de Previsão de Falta Futura (Apenas se não for falta prevista ou justificada já registrada) */}
                {todayAttendance?.status?.value !== 'pre_justified' && todayAttendance?.status?.value !== 'justified' && (
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity 
                            style={styles.actionOutlinedButton} 
                            onPress={() => handleOpenJustifyModal('tomorrow')}
                        >
                            <MaterialCommunityIcons name="calendar-clock" size={20} color={Theme.colors.primary} />
                            <Text style={styles.actionOutlinedButtonText}>Notificar Falta Futura (Amanhã)</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Atividades do Dia (Agenda) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CRONOGRAMA DE ATIVIDADES</Text>
                    {activities.length === 0 ? (
                        <View style={styles.emptyActivitiesContainer}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={Theme.colors.gray[300]} />
                            <Text style={styles.emptyActivitiesText}>Nenhuma atividade agendada para hoje.</Text>
                        </View>
                    ) : (
                        activities.map((act) => (
                            <ActivityCard
                                key={act.id}
                                type={act.category.toUpperCase()}
                                time={`${act.startTime} – ${act.endTime}`}
                                title={act.title}
                                location={act.description || 'Sala de aula'}
                                icon={getCategoryIcon(act.category)}
                                style={styles.activityCard}
                            />
                        ))
                    )}
                </View>

                {/* Resumo Mensal */}
                <AppCard style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryTitle}>Resumo do Mês</Text>
                            <Text style={styles.summarySubtitle}>
                                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.frequencyContainer}>
                            <Text style={styles.frequencyValue}>{stats.frequency}</Text>
                            <Text style={styles.frequencyLabel}>FREQUÊNCIA</Text>
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: stats.frequency as any }]} />
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{stats.presences}</Text>
                            <Text style={styles.statText}>PRESENÇAS</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.absences}</Text>
                            <Text style={styles.statText}>FALTAS</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: Theme.colors.primary }]}>{stats.justifications}</Text>
                            <Text style={styles.statText}>JUSTIF.</Text>
                        </View>
                    </View>
                </AppCard>

                {/* Botão Histórico Completo */}
                <AppButton
                    variant="primary"
                    title="Ver Histórico de Presenças"
                    icon="calendar-month"
                    onPress={() => navigation.navigate('AttendanceHistory', { childId, childName: child?.name?.value || initialChildName })}
                    style={styles.historyButton}
                />
            </ScrollView>

            {/* Modal de Justificativa */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={justificationModalVisible}
                onRequestClose={() => setJustificationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <Text style={styles.modalTitle}>
                                {selectedDay === 'tomorrow' ? 'Prever Falta Futura' : 'Justificar Falta de Hoje'}
                            </Text>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalLabel}>
                                {selectedDay === 'tomorrow' ? 'Sinalizar ausência planejada para o próximo dia.' : 'Informe o motivo da ausência do seu filho hoje.'}
                            </Text>

                            <View style={styles.dateSelectorContainer}>
                                <Text style={styles.inputHeading}>DATA DA FALTA</Text>
                                <View style={styles.dateSelectorRow}>
                                    <TouchableOpacity 
                                        style={[styles.dateSelectorButton, selectedDay === 'today' && styles.dateSelectorActive]}
                                        onPress={() => setSelectedDay('today')}
                                    >
                                        <Text style={[styles.dateSelectorText, selectedDay === 'today' && styles.dateSelectorTextActive]}>
                                            Hoje ({new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.dateSelectorButton, selectedDay === 'tomorrow' && styles.dateSelectorActive]}
                                        onPress={() => setSelectedDay('tomorrow')}
                                    >
                                        <Text style={[styles.dateSelectorText, selectedDay === 'tomorrow' && styles.dateSelectorTextActive]}>
                                            Amanhã ({new Date(Date.now() + 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.inputHeading}>MOTIVO / DETALHES</Text>
                            <TextInput
                                style={styles.justificationInput}
                                placeholder="Ex: Consulta médica, repouso sob orientação, motivos familiares..."
                                placeholderTextColor={Theme.colors.gray[400]}
                                multiline
                                numberOfLines={4}
                                maxLength={200}
                                value={justificationReason}
                                onChangeText={setJustificationReason}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={styles.cancelModalButton}
                                    onPress={() => setJustificationModalVisible(false)}
                                    disabled={justificationSubmitting}
                                >
                                    <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.confirmModalButton}
                                    onPress={handleConfirmJustification}
                                    disabled={justificationSubmitting}
                                >
                                    {justificationSubmitting ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                            <Text style={styles.confirmModalButtonText}>Confirmar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    activityCard: {
        marginBottom: Theme.spacing.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    loadingText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 10,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        marginBottom: 16,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#DBEAFE',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    statusBadgeDot: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        ...Theme.typography.h1,
        fontSize: 32,
        color: Theme.colors.onBackground,
        textAlign: 'center',
    },
    classInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    classText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginLeft: 6,
    },
    section: {
        marginBottom: Theme.spacing.lg,
    },
    sectionTitle: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#3182CE',
        letterSpacing: 1,
        marginBottom: 12,
    },
    presenceCard: {
        flexDirection: 'row',
        backgroundColor: '#DCFCE7',
        padding: Theme.spacing.lg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        alignItems: 'center',
    },
    presenceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    presenceContent: {
        flex: 1,
    },
    presenceLabel: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#15803D',
        letterSpacing: 1,
    },
    presenceStatus: {
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
        fontWeight: '700',
        marginTop: 2,
    },
    presenceTime: {
        fontWeight: '400',
        color: Theme.colors.gray[600],
    },
    
    // Absent presence card styles
    presenceAbsentCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FEE2E2',
    },
    presenceAbsentIcon: {
        backgroundColor: '#EF4444',
    },
    presenceAbsentLabel: {
        color: '#B91C1C',
    },
    justifyBadgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 4
    },
    justifyBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B91C1C',
    },

    // Justified presence card styles
    presenceJustifiedCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FEF3C7',
    },
    presenceJustifiedIcon: {
        backgroundColor: '#D97706',
    },
    presenceJustifiedLabel: {
        color: '#B45309',
    },

    // Pending presence card styles
    presencePendingCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    presencePendingIcon: {
        backgroundColor: '#94A3B8',
    },
    presencePendingLabel: {
        color: '#475569',
    },
    preJustifyBadgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 4
    },
    preJustifyBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B45309',
    },

    actionButtonsRow: {
        marginBottom: Theme.spacing.lg,
    },
    actionOutlinedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Theme.colors.primary,
        borderRadius: 20,
        height: 52,
        gap: 8,
    },
    actionOutlinedButtonText: {
        ...Theme.typography.body2,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },

    emptyActivitiesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Theme.spacing.xl,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyActivitiesText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 8,
        textAlign: 'center',
    },

    summaryCard: {
        padding: Theme.spacing.lg,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        marginBottom: Theme.spacing.xl,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    summaryTitle: {
        ...Theme.typography.h3,
        fontSize: 20,
        color: Theme.colors.onBackground,
    },
    summarySubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    frequencyContainer: {
        alignItems: 'flex-end',
    },
    frequencyValue: {
        ...Theme.typography.h1,
        fontSize: 32,
        color: Theme.colors.primary,
    },
    frequencyLabel: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: Theme.colors.primary,
        letterSpacing: 1,
    },
    progressBarContainer: {
        marginBottom: 24,
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 6,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        width: '30%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    statNumber: {
        ...Theme.typography.h2,
        fontSize: 24,
        color: '#059669',
    },
    statText: {
        ...Theme.typography.caption,
        fontSize: 9,
        fontWeight: '800',
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
    historyButton: {
        height: 60,
        borderRadius: 30,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        alignItems: 'center',
        paddingTop: 14,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#CBD5E1',
        marginBottom: 12,
    },
    modalTitle: {
        ...Theme.typography.h3,
        fontSize: 20,
        color: Theme.colors.onBackground,
    },
    modalForm: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: 16,
    },
    modalLabel: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginBottom: 20,
        lineHeight: 20,
    },
    inputHeading: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 8,
    },
    dateSelectorContainer: {
        marginBottom: 20,
    },
    dateSelectorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateSelectorButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    dateSelectorActive: {
        backgroundColor: '#EFF6FF',
        borderColor: Theme.colors.primary,
    },
    dateSelectorText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
    },
    dateSelectorTextActive: {
        color: Theme.colors.primary,
    },
    justificationInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 14,
        textAlignVertical: 'top',
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        height: 100,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelModalButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelModalButtonText: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
    },
    confirmModalButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: Theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalButtonText: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
