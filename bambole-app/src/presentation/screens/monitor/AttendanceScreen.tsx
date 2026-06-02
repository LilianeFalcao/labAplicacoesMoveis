import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClassDashboardTabsParamList } from '../../navigation/types';
import { SupabaseChildRepository } from '@/infrastructure/enrollment/repositories/SupabaseChildRepository';
import { TakeAttendanceUseCase } from '@/application/attendance/use-cases/TakeAttendanceUseCase';
import { SupabaseAttendanceRepository } from '@/infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { SupabaseClassRepository } from '@/infrastructure/activity/repositories/SupabaseClassRepository';
import { SupabaseAgendaRepository } from '@/infrastructure/activity/repositories/SupabaseAgendaRepository';
import { ClassActivity } from '@/domain/activity/repositories/IAgendaRepository';
import { ConnectivityService, ConnectivityStatus } from '@/infrastructure/network/ConnectivityService';
import { OfflineSyncService } from '@/infrastructure/offline/OfflineSyncService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RECREATION_CENTER_LOCATION, MAX_ALLOWED_DISTANCE_METERS } from '@/infrastructure/location/config';
import { getDistanceHaversine } from '@/infrastructure/location/distance';

type AttendanceRouteProp = RouteProp<ClassDashboardTabsParamList, 'Attendance'>;
type AttendanceNavigationProp = StackNavigationProp<any>;

export const AttendanceScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<AttendanceNavigationProp>();
    const route = useRoute<AttendanceRouteProp>();
    const insets = useSafeAreaInsets();

    const classId = route.params?.classId;
    const groupName = route.params?.groupName || 'Turma';

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectivityStatus>('online');
    const [activities, setActivities] = useState<ClassActivity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<ClassActivity | null>(null);
    const [loadingActivities, setLoadingActivities] = useState(true);

    const detectOngoingActivity = (activitiesList: ClassActivity[]): ClassActivity | null => {
        const now = new Date();
        const currentH = now.getHours();
        const currentM = now.getMinutes();
        const currentTotal = currentH * 60 + currentM;

        for (const act of activitiesList) {
            const [sh, sm] = act.startTime.split(':').map(Number);
            const [eh, em] = act.endTime.split(':').map(Number);
            const startTotal = sh * 60 + sm;
            const endTotal = eh * 60 + em;

            if (currentTotal >= startTotal && currentTotal <= endTotal) {
                return act;
            }
        }
        
        const ongoing = activitiesList.find(a => a.status === 'ongoing');
        if (ongoing) return ongoing;

        return null;
    };

    const loadActivities = async () => {
        try {
            setLoadingActivities(true);
            const repo = SupabaseAgendaRepository.getInstance();
            const list = await repo.findByClass(classId);
            
            const sorted = list.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setActivities(sorted);

            const ongoing = detectOngoingActivity(sorted);
            setSelectedActivity(ongoing);
        } catch (err) {
            console.error('Failed to load activities', err);
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        const connectivity = ConnectivityService.getInstance();
        const listener = (status: ConnectivityStatus) => setConnectionStatus(status);
        connectivity.addListener(listener);
        
        loadStudents();
        loadActivities();

        return () => connectivity.removeListener(listener);
    }, [classId]);

    const loadStudents = async () => {
        try {
            const repo = new SupabaseChildRepository();
            const attendanceRepo = new SupabaseAttendanceRepository();
            const todayStr = new Date().toISOString().split('T')[0];

            const [list, attendanceRecords] = await Promise.all([
                repo.findByClass(classId),
                attendanceRepo.findByClassAndDate(classId, todayStr)
            ]);

            setStudents(list.map(s => {
                const record = attendanceRecords.find(r => r.childId === s.id);
                const status = record ? record.status.value : 'present';
                return { 
                    id: s.id, 
                    name: s.name, 
                    status: status,
                    initialStatus: status,
                    justificationNote: record?.justificationNote,
                    medicalAlerts: (s as any).medicalAlerts,
                    hasImageConsent: s.hasImageConsent,
                    photoUrl: s.photoUrl
                };
            }));
        } catch (err) {
            console.error('Failed to load students', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id: string, status: 'present' | 'absent') => {
        const student = students.find(s => s.id === id);
        if (!student) return;

        const isOriginalJustified = student.initialStatus === 'pre_justified' || student.initialStatus === 'justified';

        if (status === 'present') {
            if (isOriginalJustified && student.status !== 'present') {
                Alert.alert(
                    'Alterar Status de Aluno Justificado',
                    `Este aluno possui uma falta justificada pelos responsáveis: "${student.justificationNote || 'Sem justificativa detalhada'}". Deseja realmente marcar como PRESENTE?`,
                    [
                        {
                            text: 'Cancelar',
                            style: 'cancel',
                        },
                        {
                            text: 'Confirmar',
                            onPress: () => {
                                setStudents(prev => prev.map(s =>
                                    s.id === id ? { ...s, status: 'present' } : s
                                ));
                            },
                        }
                    ]
                );
            } else {
                setStudents(prev => prev.map(s =>
                    s.id === id ? { ...s, status: 'present' } : s
                ));
            }
        } else {
            // status === 'absent'
            if (isOriginalJustified) {
                setStudents(prev => prev.map(s =>
                    s.id === id ? { ...s, status: s.initialStatus } : s
                ));
            } else {
                setStudents(prev => prev.map(s =>
                    s.id === id ? { ...s, status: 'absent' } : s
                ));
            }
        }
    };

    const markAllPresent = () => {
        const hasJustified = students.some(s => (s.initialStatus === 'pre_justified' || s.initialStatus === 'justified') && s.status !== 'present');
        if (hasJustified) {
            Alert.alert(
                'Marcar Todos Como Presentes',
                'Existem alunos com faltas justificadas pelos responsáveis. Deseja marcar todos como presentes (sobrescrevendo as justificativas) ou manter suas justificativas?',
                [
                    {
                        text: 'Manter Justificativas',
                        onPress: () => {
                            setStudents(prev => prev.map(s => {
                                const isJustified = s.initialStatus === 'pre_justified' || s.initialStatus === 'justified';
                                return isJustified ? s : { ...s, status: 'present' };
                            }));
                        }
                    },
                    {
                        text: 'Sobrescrever Tudo',
                        style: 'destructive',
                        onPress: () => {
                            setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
                        }
                    },
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    }
                ]
            );
        } else {
            setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
        }
    };

    const showAlerts = (student: any) => {
        if (student.medicalAlerts && student.medicalAlerts.length > 0) {
            Alert.alert(
                `Alertas: ${student.name.value}`,
                student.medicalAlerts.join('\n'),
                [{ text: 'Entendido', style: 'default' }]
            );
        }
    };

    const submitAttendance = async () => {
        setIsSummaryModalVisible(false);
        setSubmitting(true);
        try {


            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Erro', 'Permissão de localização é necessária para realizar a chamada.');
                setSubmitting(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const geo = { lat: location.coords.latitude, lng: location.coords.longitude };

            const distance = getDistanceHaversine(
                geo.lat,
                geo.lng,
                RECREATION_CENTER_LOCATION.latitude,
                RECREATION_CENTER_LOCATION.longitude
            );

            if (distance > MAX_ALLOWED_DISTANCE_METERS) {
                Alert.alert(
                    'Fora do Limite',
                    `Você está a ${Math.round(distance)}m do Centro Recreativo. A chamada só pode ser realizada de dentro do limite físico (200m).`
                );
                setSubmitting(false);
                return;
            }

            const useCase = new TakeAttendanceUseCase(
                new SupabaseAttendanceRepository(),
                new SupabaseClassRepository(),
                SupabaseAgendaRepository.getInstance()
            );

            await useCase.execute(
                classId,
                user!.id,
                new Date(),
                students.map(s => ({
                    childId: s.id,
                    status: s.status,
                    geolocation: s.status === 'present' ? geo : undefined
                })),
                selectedActivity?.id
            );

            // Trigger background sync in case of other pending items
            const syncService = new OfflineSyncService();
            syncService.syncUp().catch(err => console.error("AttendanceScreen auto-sync error:", err));

            Alert.alert(
                'Sucesso',
                'Chamada realizada com sucesso!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao realizar chamada.');
        } finally {
            setSubmitting(false);
        }
    };

    const OfflineBadge = () => {
        if (connectionStatus === 'online') return null;
        return (
            <View style={styles.offlineBadge}>
                <MaterialCommunityIcons name="wifi-off" size={14} color="#B45309" />
                <Text style={styles.offlineBadgeText}>Modo Offline</Text>
            </View>
        );
    };

    if (!classId) {
        return (
            <SafeAreaView style={styles.mainContainer} edges={['left', 'right']}>
                <AppHeader title="Erro" showBack onBack={() => navigation.goBack()} />
                <View style={styles.center}>
                    <Text>Erro: Turma não selecionada ou contexto perdido.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.length - presentCount;

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right']}>
            <AppHeader
                title="Chamada da Turma"
                showBack
                onBack={() => navigation.goBack()}
            />
            
            <View style={styles.flex1}>
                <View style={styles.headerInfo}>
                    <View>
                        <View style={styles.titleRow}>
                            <Text style={styles.groupName}>{groupName}</Text>
                            <OfflineBadge />
                        </View>
                        <Text style={styles.subtext}>Selecione a presença de cada aluno</Text>
                    </View>
                    <TouchableOpacity style={styles.bulkActionBtn} onPress={markAllPresent}>
                        <MaterialCommunityIcons name="check-all" size={20} color={Theme.colors.primary} />
                        <Text style={styles.bulkActionText}>Todos</Text>
                    </TouchableOpacity>
                </View>

                {/* Dynamic Agenda Activities Carousel */}
                <View style={styles.carouselContainer}>
                    <Text style={styles.carouselTitle}>Vincular Chamada a Atividade de Hoje</Text>
                    <FlatList
                        horizontal
                        data={[{ id: 'default', title: 'Padrão / Geral', category: 'general' } as any, ...activities]}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselScroll}
                        renderItem={({ item }) => {
                            const isSelected = item.id === 'default' ? selectedActivity === null : selectedActivity?.id === item.id;
                            const isOngoing = item.status === 'ongoing';
                            
                            let bgActive = '#E0F2FE'; 
                            let textActive = '#0369A1';
                            let iconName: any = 'calendar';

                            if (item.category === 'activity') {
                                bgActive = '#E0F2FE'; 
                                textActive = '#0369A1';
                                iconName = 'calendar-clock';
                            } else if (item.category === 'meal') {
                                bgActive = '#FEF3C7'; 
                                textActive = '#D97706';
                                iconName = 'food-fork-drink';
                            } else if (item.category === 'break') {
                                bgActive = '#F3E8FF'; 
                                textActive = '#7C3AED';
                                iconName = 'coffee';
                            }

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedActivity(item.id === 'default' ? null : item)}
                                    style={[
                                        styles.carouselCard,
                                        isSelected && {
                                            borderColor: textActive,
                                            backgroundColor: bgActive,
                                            shadowColor: textActive,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.15,
                                            shadowRadius: 6,
                                            elevation: 3
                                        },
                                        isOngoing && !isSelected && {
                                            borderStyle: 'dashed',
                                            borderColor: Theme.colors.primary,
                                        }
                                    ]}
                                >
                                    <View style={styles.carouselCardHeader}>
                                        <View style={[
                                            styles.iconContainer,
                                            { backgroundColor: isSelected ? '#FFF' : Theme.colors.gray[100] }
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={iconName}
                                                size={16}
                                                color={isSelected ? textActive : Theme.colors.gray[500]}
                                            />
                                        </View>
                                        {isOngoing && (
                                            <View style={styles.ongoingBadge}>
                                                <Text style={styles.ongoingBadgeText}>AGORA</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text 
                                        style={[
                                            styles.activityTitle,
                                            isSelected && { color: textActive, fontWeight: '700' }
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text 
                                        style={[
                                            styles.activityTime,
                                            isSelected && { color: textActive }
                                        ]}
                                    >
                                        {item.id === 'default' ? 'Horário Padrão' : `${item.startTime} - ${item.endTime}`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                    {activities.length === 0 && (
                        <View style={styles.emptyActivitiesBanner}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#6B7280" />
                            <Text style={styles.emptyActivitiesBannerText}>
                                Nenhuma atividade cadastrada para hoje. Cadastre atividades na Agenda para vinculá-las aqui.
                            </Text>
                        </View>
                    )}
                </View>

                {/* List Header Section */}
                <View style={styles.listHeaderSection}>
                    <Text style={styles.listHeaderTitle}>Alunos da Turma</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{students.length} Total</Text>
                    </View>
                </View>

                <FlatList
                    data={students}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 130 }]}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <AppCard style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                                <View style={[styles.avatar, { backgroundColor: item.status === 'present' ? Theme.colors.status.present.bg : Theme.colors.gray[100] }]}>
                                    {item.photoUrl ? (
                                        <Image source={{ uri: item.photoUrl }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={[styles.avatarText, { color: item.status === 'present' ? Theme.colors.status.present.text : Theme.colors.gray[400] }]}>
                                            {item.name.value[0]}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.nameContainer}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name} numberOfLines={1}>{item.name.value}</Text>
                                        {item.medicalAlerts && item.medicalAlerts.length > 0 && (
                                            <TouchableOpacity onPress={() => showAlerts(item)}>
                                                <MaterialCommunityIcons 
                                                    name="alert-circle" 
                                                    size={18} 
                                                    color="#F59E0B" 
                                                    style={styles.alertIcon}
                                                />
                                            </TouchableOpacity>
                                        )}

                                    </View>
                                    <Text style={styles.statusLabel}>
                                        {item.status === 'present' ? 'Presente' : 
                                         (item.status === 'pre_justified' || item.status === 'justified') ? 'Ausente (Justificado)' : 'Ausente'}
                                    </Text>
                                    {(item.status === 'pre_justified' || item.status === 'justified') && (
                                        <TouchableOpacity 
                                            onPress={() => {
                                                Alert.alert(
                                                    'Justificativa de Ausência',
                                                    item.justificationNote || 'Nenhuma justificativa detalhada fornecida pelos responsáveis.',
                                                    [{ text: 'Fechar', style: 'default' }]
                                                );
                                            }}
                                            style={styles.justifiedBadge}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons name="file-document-outline" size={12} color="#D97706" />
                                            <Text style={styles.justifiedBadgeText}>Justificativa</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        onPress={() => toggleStatus(item.id, 'present')}
                                        style={[styles.toggleBtn, item.status === 'present' && styles.presentActive]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color={item.status === 'present' ? '#FFF' : Theme.colors.gray[300]}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => toggleStatus(item.id, 'absent')}
                                        style={[
                                            styles.toggleBtn, 
                                            (item.status === 'absent' || item.status === 'pre_justified' || item.status === 'justified') && styles.absentActive
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={20}
                                            color={(item.status === 'absent' || item.status === 'pre_justified' || item.status === 'justified') ? '#FFF' : Theme.colors.gray[300]}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </AppCard>
                    )}
                />
            </View>

            <View style={[styles.footer, { bottom: 0, paddingBottom: 12 }]}>
                <View style={styles.progressSection}>
                    <Text style={styles.progressText}>
                        {presentCount} de {students.length} marcados
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${students.length > 0 ? (presentCount / students.length) * 100 : 0}%` }
                            ]}
                        />
                    </View>
                </View>
                <AppButton
                    title="Confirmar Chamada"
                    onPress={() => setIsSummaryModalVisible(true)}
                    loading={submitting}
                    style={styles.submitBtn}
                    icon="arrow-right"
                />
            </View>

            {/* Summary Modal */}
            <AttendanceSummaryModal 
                isVisible={isSummaryModalVisible}
                onClose={() => setIsSummaryModalVisible(false)}
                onConfirm={submitAttendance}
                presentCount={presentCount}
                absentCount={absentCount}
                loading={submitting}
                selectedActivity={selectedActivity}
            />
        </SafeAreaView>
    );
};

// Internal Modal Component for simplicity
const AttendanceSummaryModal = ({ isVisible, onClose, onConfirm, presentCount, absentCount, loading, selectedActivity }: any) => {
    if (!isVisible) return null;

    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={Theme.colors.primary} style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Resumo da Chamada</Text>
                <Text style={styles.modalSubtitle}>Confira os totais antes de finalizar</Text>

                <View style={styles.modalActivityLabelContainer}>
                    <MaterialCommunityIcons 
                        name={selectedActivity ? 'calendar-clock' : 'calendar'} 
                        size={16} 
                        color={Theme.colors.gray[500]} 
                    />
                    <Text style={styles.modalActivityLabelText}>
                        Vínculo: <Text style={{ fontWeight: '700', color: Theme.colors.onBackground }}>{selectedActivity ? selectedActivity.title : 'Horário Padrão (Geral)'}</Text>
                    </Text>
                </View>

                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryBox, { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.summaryValue, { color: '#16A34A' }]}>{presentCount}</Text>
                        <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>Presentes</Text>
                    </View>
                    <View style={[styles.summaryBox, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.summaryValue, { color: '#DC2626' }]}>{absentCount}</Text>
                        <Text style={[styles.summaryLabel, { color: '#DC2626' }]}>Ausentes</Text>
                    </View>
                </View>

                <Text style={styles.modalInfo}>Sua localização será registrada para confirmar o ponto de chamada.</Text>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                        <Text style={styles.cancelBtnText}>Corrigir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
                        onPress={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.confirmBtnText}>Confirmar e Enviar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.md,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupName: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    offlineBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B45309',
    },
    subtext: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    statsBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    statsText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    studentCard: {
        marginBottom: Theme.spacing.sm,
        padding: Theme.spacing.md,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    avatarText: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
    },
    nameContainer: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    statusLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: Theme.spacing.sm,
    },
    toggleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    presentActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    absentActive: {
        backgroundColor: Theme.colors.error,
        borderColor: Theme.colors.error,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderTopWidth: 1,
        borderColor: Theme.colors.gray[100],
    },
    progressSection: {
        marginBottom: 12,
    },
    progressText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
        marginBottom: 6,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: Theme.colors.gray[100],
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 2,
    },
    submitBtn: {
        height: 48,
        minHeight: 48,
        paddingVertical: 0,
    },
    flex1: { flex: 1 },
    bulkActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    bulkActionText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        marginLeft: 6,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertIcon: {
        marginLeft: 8,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    modalSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[400],
        marginBottom: 24,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        marginBottom: 24,
    },
    summaryBox: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    summaryValue: {
        ...Theme.typography.h2,
        fontWeight: 'bold',
    },
    summaryLabel: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
    },
    modalInfo: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginBottom: 32,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
    },
    confirmBtn: {
        flex: 2,
        height: 52,
        borderRadius: 14,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnText: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: '#FFF',
    },
    carouselContainer: {
        backgroundColor: Theme.colors.background,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 0,
    },
    carouselTitle: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: Theme.spacing.md,
        marginBottom: 10,
    },
    carouselScroll: {
        paddingHorizontal: Theme.spacing.md,
        gap: 12,
        paddingBottom: 4,
    },
    carouselCard: {
        backgroundColor: '#FFF',
        borderColor: Theme.colors.gray[200],
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 12,
        width: 145,
        justifyContent: 'space-between',
        height: 96,
    },
    carouselCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ongoingBadge: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ongoingBadgeText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    activityTitle: {
        ...Theme.typography.caption,
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.onBackground,
        marginTop: 6,
    },
    activityTime: {
        fontSize: 10,
        fontWeight: '500',
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    modalActivityLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.gray[50],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        marginBottom: 16,
        width: '100%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    modalActivityLabelText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
    },
    listHeaderSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: Theme.colors.background,
    },
    listHeaderTitle: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    countBadge: {
        backgroundColor: Theme.colors.gray[200],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Theme.colors.gray[600],
    },
    emptyActivitiesBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginHorizontal: 16,
        marginTop: 8,
        gap: 6,
    },
    emptyActivitiesBannerText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
        flex: 1,
    },
    justifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
        marginTop: 4,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    justifiedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D97706',
    },
});

