import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeType } from '../../styles/Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonitorSummaryCard } from '../../components/monitor/MonitorSummaryCard';
import { TurmaAgendaCard } from '../../components/monitor/TurmaAgendaCard';
// MONITOR_DASHBOARD_DATA has been removed.
import { ClassSelectionModal } from '../../components/monitor/ClassSelectionModal';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { SupabaseAccessRequestRepository } from '../../../infrastructure/activity/repositories/SupabaseAccessRequestRepository';
import { SupabaseUserRepository } from '../../../infrastructure/identity/repositories/SupabaseUserRepository';
import { ExpoPushService } from '../../../infrastructure/notifications/ExpoPushService';
import { GetClassesWithoutMonitorUseCase } from '../../../application/activity/use-cases/GetClassesWithoutMonitorUseCase';
import { RequestTemporaryAccessUseCase } from '../../../application/activity/use-cases/RequestTemporaryAccessUseCase';
import { GetMonitorClassesUseCase } from '../../../application/activity/use-cases/GetMonitorClassesUseCase';
import { GetMonitorAverageAttendanceUseCase } from '../../../application/attendance/use-cases/GetMonitorAverageAttendanceUseCase';
import { MockNotificationRepository } from '../../../infrastructure/notification/repositories/MockNotificationRepository';
import { SupabaseAttendanceRepository } from '../../../infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { NotificationService } from '../../../infrastructure/notification/services/NotificationService';
import { SpeedDial, SpeedDialAction } from '../../components/base/SpeedDial';
import { IncidentReportModal } from '../../components/monitor/IncidentReportModal';
import { MultiClassNoticeModal } from '../../components/monitor/MultiClassNoticeModal';
import { CameraView, Camera } from 'expo-camera';
import { UploadActivityPhotoUseCase } from '../../../application/activity/use-cases/UploadActivityPhotoUseCase';
import { MockActivityRepository } from '../../../infrastructure/activity/repositories/MockActivityRepository';
import { MonitorSidebar } from '../../components/monitor/MonitorSidebar';
import { MockAgendaRepository, ClassActivity } from '../../../infrastructure/activity/repositories/MockAgendaRepository';
import { QuickAddActivityModal } from '../../components/monitor/QuickAddActivityModal';
import { SupabaseAnnouncementRepository } from '../../../infrastructure/communication/repositories/SupabaseAnnouncementRepository';
import { SendAnnouncementUseCase } from '../../../application/communication/use-cases/SendAnnouncementUseCase';

import { SqliteStorageService } from '../../../infrastructure/storage/SqliteStorageService';
import { OfflineSyncService } from '../../../infrastructure/offline/OfflineSyncService';
import { ConnectivityService, ConnectivityStatus } from '../../../infrastructure/network/ConnectivityService';

export const MonitorHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors, activeTheme, isDark } = useTheme();
    const styles = createStyles(colors, activeTheme, isDark);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [monitorClassesData, setMonitorClassesData] = useState<any[]>([]);
    const [todayAgenda, setTodayAgenda] = useState<ClassActivity[]>([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [avgAttendance, setAvgAttendance] = useState('N/A');
    const [isIncidentModalVisible, setIsIncidentModalVisible] = useState(false);
    const [isMultiNoticeModalVisible, setIsMultiNoticeModalVisible] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [monitorClasses, setMonitorClasses] = useState<any[]>([]);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isPhotoSelectionVisible, setIsPhotoSelectionVisible] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectivityStatus>('online');
    const [isQuickActivityModalVisible, setIsQuickActivityModalVisible] = useState(false);

    const storage = SqliteStorageService.getInstance();
    const syncService = new OfflineSyncService();

    const checkPendingSync = async () => {
        try {
            const count = await storage.query<any>("SELECT COUNT(*) as total FROM sync_queue WHERE status = 'pending'");
            setPendingSyncCount(count[0]?.total || 0);
        } catch (error) {
            console.error('Failed to check pending sync', error);
        }
    };

    const handleSyncNow = async (isManual: boolean = false) => {
        if (syncing) return;
        setSyncing(true);
        try {
            await syncService.syncUp();
            await checkPendingSync();
            if (pendingSyncCount === 0 && isManual) {
                Alert.alert('Sucesso', 'Todos os dados foram sincronizados!');
            }
        } catch (error) {
            if (isManual) {
                Alert.alert('Aviso', 'Alguns itens ainda não puderam ser sincronizados. Tentaremos novamente em breve.');
            }
        } finally {
            setSyncing(false);
        }
    };

    // Initialize repositories and use cases
    const notificationRepo = MockNotificationRepository.getInstance();
    const notificationService = NotificationService.getInstance();
    const classRepo = new SupabaseClassRepository();
    const accessRequestRepo = new SupabaseAccessRequestRepository();
    const attendanceRepo = new SupabaseAttendanceRepository();
    const getClassesUseCase = new GetClassesWithoutMonitorUseCase(classRepo);
    const requestAccessUseCase = new RequestTemporaryAccessUseCase(
        accessRequestRepo,
        new SupabaseUserRepository(),
        new ExpoPushService()
    );
    const getMonitorClassesUseCase = new GetMonitorClassesUseCase(classRepo, accessRequestRepo);
    const getMonitorAverageAttendanceUseCase = new GetMonitorAverageAttendanceUseCase(classRepo, accessRequestRepo, attendanceRepo);

    const loadDynamicData = async () => {
        try {
            const monitorId = user?.id || 'monitor-mock-id';
            const classes = await getMonitorClassesUseCase.execute(monitorId);
            setMonitorClasses(classes);
            const avg = await getMonitorAverageAttendanceUseCase.execute(monitorId);
            
            setAvgAttendance(avg);

            const newAgendaItems = classes.map((cls) => {
                const isAvailable = cls.isCallAllowedNow();
                return {
                    id: cls.id,
                    name: cls.name,
                    category: 'Regular',
                    status: isAvailable ? ('pending' as const) : ('upcoming' as const),
                    statusLabel: isAvailable ? 'Em Andamento' : 'Próxima Aula',
                    ageGroup: cls.ageGroup,
                    timeLabel: cls.timeLabel,
                    location: 'A definir',
                    students: 0 // Mock count
                };
            });

            setMonitorClassesData(newAgendaItems);

            // Load activities for the first class (or all)
            if (classes.length > 0) {
                const agendaRepo = MockAgendaRepository.getInstance();
                const activities = await agendaRepo.findByClass(classes[0].id);
                setTodayAgenda(activities);
            }
        } catch (error) {
            console.error('Failed to load dynamic agenda', error);
        }
    };

    const handleToggleActivity = async (id: string) => {
        const item = todayAgenda.find(a => a.id === id);
        if (!item) return;

        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        await MockAgendaRepository.getInstance().updateStatus(id, newStatus);
        setTodayAgenda(prev => prev.map(a => 
            a.id === id ? { ...a, status: newStatus } : a
        ));
    };

    useFocusEffect(
        useCallback(() => {
            loadDynamicData();
            checkPendingSync();
            
            const connectivity = ConnectivityService.getInstance();
            const connListener = (status: ConnectivityStatus) => {
                setConnectionStatus(status);
                if (status === 'online') handleSyncNow();
            };
            connectivity.addListener(connListener);

            // Poll for pending sync every 10 seconds
            const pollInterval = setInterval(checkPendingSync, 10000);

            // Request push permissions
            notificationService.requestPermissions();

            // Load notifications count
            const updateUnreadCount = async () => {
                if (user?.id) {
                    const count = await notificationRepo.countUnreadByRecipientId(user.id);
                    setHasUnreadNotifications(count > 0);
                }
            };
            updateUnreadCount();

            // Subscribe to changes in the access request repository
            const unsubscribeRequests = accessRequestRepo.subscribe(() => {
                loadDynamicData();
            });
            
            // Subscribe to changes in notifications
            const unsubscribeNotifications = notificationRepo.subscribe(() => {
                updateUnreadCount();
            });

            // Subscribe to changes in attendance (updates stats card)
            const unsubscribeAttendance = attendanceRepo.subscribe(() => {
                loadDynamicData();
                checkPendingSync();
            });

            return () => {
                connectivity.removeListener(connListener);
                clearInterval(pollInterval);
                unsubscribeRequests();
                unsubscribeNotifications();
                unsubscribeAttendance();
            };
        }, [user?.id])
    );

    const HeaderSyncButton = () => {
        if (syncing) {
            return (
                <View style={styles.headerIcon}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            );
        }

        if (connectionStatus === 'offline') {
            return (
                <TouchableOpacity 
                    style={styles.headerIcon}
                    onPress={() => Alert.alert('Offline', 'Você está offline no momento. Suas alterações e presenças marcadas foram armazenadas localmente com total segurança e serão sincronizadas com o servidor automaticamente assim que você restabelecer sua conexão de internet.')}
                >
                    <MaterialCommunityIcons name="cloud-off-outline" size={24} color={colors.gray[400]} />
                </TouchableOpacity>
            );
        }

        if (pendingSyncCount > 0) {
            return (
                <TouchableOpacity 
                    style={styles.headerIcon}
                    onPress={() => handleSyncNow(true)}
                >
                    <View style={styles.headerIconWithBadge}>
                        <View style={styles.syncBadgeCircle}>
                            <Text style={styles.syncBadgeText}>{pendingSyncCount}</Text>
                        </View>
                        <MaterialCommunityIcons name="cloud-sync" size={24} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => handleSyncNow(true)}
            >
                <MaterialCommunityIcons name="cloud-check" size={24} color="#059669" />
            </TouchableOpacity>
        );
    };

    const handleSendMultiNotice = async (classIds: string[], content: string) => {
        try {
            if (!user) {
                Alert.alert('Erro', 'Você precisa estar logado para enviar um comunicado.');
                throw new Error('User not logged in');
            }
            if (!content || !content.trim()) {
                Alert.alert('Erro', 'O conteúdo do comunicado não pode ser vazio.');
                throw new Error('Announcement content is empty');
            }
            if (classIds.length === 0) {
                Alert.alert('Erro', 'Selecione pelo menos uma turma.');
                throw new Error('No class selected');
            }

            const announceRepo = new SupabaseAnnouncementRepository();
            const userRepo = new SupabaseUserRepository();
            const pushService = new ExpoPushService();
            const useCase = new SendAnnouncementUseCase(announceRepo, userRepo, pushService);

            await useCase.execute(user.id, content, 'class', classIds);
        } catch (error: any) {
            console.error('Failed to send announcement', error);
            Alert.alert('Erro', `Falha ao enviar o comunicado: ${error.message || error}`);
            throw error;
        }
    };

    const handleQuickPhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
            setIsCameraVisible(true);
        } else {
            Alert.alert('Erro', 'Permissão de câmera é necessária.');
        }
    };

    const onTakePhoto = (uri: string) => {
        setCapturedPhoto(uri);
        setIsCameraVisible(false);
        setIsPhotoSelectionVisible(true);
    };

    const handleSaveCapturedPhoto = async (classIds: string[]) => {
        if (!capturedPhoto) return;
        
        try {
            const repo = MockActivityRepository.getInstance();
            const useCase = new UploadActivityPhotoUseCase(repo);
            
            for (const classId of classIds) {
                await useCase.execute({
                    classId,
                    photoUri: capturedPhoto,
                    caption: 'Captura rápida da Home',
                    monitorId: user?.id || 'monitor-mock-id'
                });
            }
            
            Alert.alert('Sucesso', 'Foto enviada para as turmas selecionadas!');
            setCapturedPhoto(null);
            setIsPhotoSelectionVisible(false);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao enviar foto.');
        }
    };

    const speedDialActions: SpeedDialAction[] = [
        {
            icon: 'calendar-plus',
            label: 'Nova Atividade',
            onPress: () => {
                if (monitorClasses.length === 0) {
                    Alert.alert(
                        'Sem turma atribuída',
                        'Você precisa ter uma turma atribuída para criar atividades.'
                    );
                } else {
                    setIsQuickActivityModalVisible(true);
                }
            },
            color: '#059669'
        },
        {
            icon: 'alert-circle',
            label: 'Relatar Incidente',
            onPress: () => setIsIncidentModalVisible(true),
            color: colors.error
        },
        {
            icon: 'camera',
            label: 'Captura Espontânea',
            onPress: handleQuickPhoto,
            color: colors.primary
        },
        {
            icon: 'bullhorn',
            label: 'Comunicado Global',
            onPress: () => setIsMultiNoticeModalVisible(true),
            color: '#0891B2'
        },
        {
            icon: 'plus-box',
            label: 'Solicitar Turma',
            onPress: () => setIsModalVisible(true),
            color: '#6366F1'
        }
    ];

    return (
        <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.headerIcon}
                        onPress={() => setSidebarOpen(true)}
                    >
                        <MaterialCommunityIcons name="menu" size={24} color={colors.onBackground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bambolê</Text>
                </View>
                <View style={styles.headerRight}>
                    <HeaderSyncButton />
                    <TouchableOpacity 
                        style={styles.headerIcon} 
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        {hasUnreadNotifications && <View style={styles.notificationDot} />}
                        <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onBackground} />
                    </TouchableOpacity>
                </View>
            </View>

            <ClassSelectionModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                monitorId={user?.id || 'monitor-mock-id'}
                getClassesUseCase={getClassesUseCase}
                requestAccessUseCase={requestAccessUseCase}
                onSuccess={(className) => {
                    Alert.alert('Sucesso', `Solicitação de acesso para a turma ${className} enviada com sucesso!`);
                }}
            />

            <IncidentReportModal
                visible={isIncidentModalVisible}
                onClose={() => setIsIncidentModalVisible(false)}
                monitorId={user?.id || 'monitor-mock-id'}
            />

            <MultiClassNoticeModal
                visible={isMultiNoticeModalVisible}
                onClose={() => setIsMultiNoticeModalVisible(false)}
                classes={monitorClasses}
                onSend={handleSendMultiNotice}
            />

            <QuickAddActivityModal
                visible={isQuickActivityModalVisible}
                onClose={() => setIsQuickActivityModalVisible(false)}
                monitorClasses={monitorClasses.map(c => ({ id: c.id, name: c.name }))}
                onCreated={() => loadDynamicData()}
            />

            <MultiClassNoticeModal
                visible={isPhotoSelectionVisible}
                onClose={() => setIsPhotoSelectionVisible(false)}
                classes={monitorClasses}
                onSend={async (ids) => handleSaveCapturedPhoto(ids)}
            />

            <Modal visible={isCameraVisible} animationType="slide">
                <CameraView 
                    style={StyleSheet.absoluteFill}
                    facing={cameraFacing}
                >
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity 
                            style={styles.closeCamera}
                            onPress={() => setIsCameraVisible(false)}
                        >
                            <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.flipCamera}
                            onPress={() => setCameraFacing(prev => prev === 'back' ? 'front' : 'back')}
                        >
                            <MaterialCommunityIcons name="camera-flip" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.captureBtn}
                            onPress={async () => {
                                // Since CameraView ref is needed for takePictureAsync, 
                                // and we are using a simplified version for mock, 
                                // we'll just simulate a capture here for the demo
                                onTakePhoto('https://picsum.photos/400/600');
                            }}
                        >
                            <View style={styles.captureBtnInner} />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </Modal>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSection}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleGroup}>
                            <Text style={styles.overtitle}>BEM-VINDO</Text>
                            <Text style={styles.mainTitle}>{user?.email?.value?.split('@')[0] || 'Monitor'}</Text>
                        </View>
                        <TouchableOpacity style={styles.solicitarBtn} onPress={() => setIsModalVisible(true)}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#FFF" />
                            <Text style={styles.solicitarLabel}>Acesso</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryGrid}>
                        <MonitorSummaryCard
                            label="Média Presença"
                            value={avgAttendance}
                            icon="account-group"
                            variant="blue"
                        />
                        <MonitorSummaryCard
                            label="Hoje"
                            value={todayAgenda.length > 0 ? `${todayAgenda.filter(a => a.status === 'completed').length}/${todayAgenda.length}` : '0/0'}
                            icon="calendar-check"
                            variant="green"
                        />
                    </View>
                </View>

                {monitorClassesData.length > 0 && (
                    <View style={styles.classesSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Minhas Turmas</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classesHorizontalScroll}>
                            {monitorClassesData.map(cls => (
                                <TouchableOpacity 
                                    key={cls.id} 
                                    style={styles.classMiniCard}
                                    onPress={() => navigation.navigate('ClassDashboard', { classId: cls.id, groupName: cls.name })}
                                >
                                    <View style={styles.classIconBox}>
                                        <MaterialCommunityIcons name="school-outline" size={20} color={colors.primary} />
                                    </View>
                                    <Text style={styles.classMiniTitle} numberOfLines={1}>{cls.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.agendaSection}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
                            {todayAgenda.length > 0 && (
                                <Text style={styles.progressText}>
                                    {Math.round((todayAgenda.filter(a => a.status === 'completed').length / todayAgenda.length) * 100)}% concluído
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => {
                            if (monitorClassesData.length > 0) {
                                navigation.navigate('ClassDashboard', { 
                                    screen: 'Agenda', 
                                    params: { classId: monitorClassesData[0].id, groupName: monitorClassesData[0].name } 
                                });
                            }
                        }}>
                            <Text style={styles.seeAllText}>Ver tudo</Text>
                        </TouchableOpacity>
                    </View>

                    {todayAgenda.length > 0 ? (
                        todayAgenda.slice(0, 4).map(item => (
                            <TurmaAgendaCard
                                key={item.id}
                                activity={item}
                                onToggleStatus={handleToggleActivity}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyAgenda}>
                            <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.gray[200]} />
                            <Text style={styles.emptyText}>Nenhuma atividade cadastrada. Cadastre atividades para a turma!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <SpeedDial 
                actions={speedDialActions} 
                bottomOffset={insets.bottom + 16}
            />

            <MonitorSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: ThemeType['colors'], theme: ThemeType, isDark: boolean) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconWithBadge: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncBadgeCircle: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.primary,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: colors.background,
    },
    syncBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    topSection: {
        marginBottom: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleGroup: {
        flex: 1,
    },
    overtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: isDark ? colors.warning : '#B45309',
        letterSpacing: 1,
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.onBackground,
        lineHeight: 36,
    },
    solicitarBtn: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 4,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        marginLeft: 8,
    },
    solicitarLabel: {
        color: isDark ? colors.background : '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    syncCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.primary + '15',
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 12,
    },
    syncCardOffline: {
        borderColor: colors.warning + '30',
        backgroundColor: isDark ? colors.warning + '10' : '#FFFBEB',
    },
    syncIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: isDark ? colors.gray[100] : '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    syncTextBox: {
        flex: 1,
    },
    syncTitle: {
        ...theme.typography.body1,
        fontWeight: 'bold',
        color: colors.onBackground,
    },
    syncSub: {
        ...theme.typography.caption,
        color: colors.gray[500],
    },
    agendaSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.onBackground,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '700',
    },
    classesSection: {
        marginBottom: 32,
    },
    classesHorizontalScroll: {
        paddingRight: 32,
    },
    classMiniCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 12,
        marginRight: 12,
        width: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    classIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDark ? colors.gray[100] : '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    classMiniTitle: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: colors.onBackground,
    },
    progressText: {
        ...theme.typography.caption,
        color: colors.gray[400],
        marginTop: 2,
    },
    emptyAgenda: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: colors.background,
        borderRadius: 24,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    emptyText: {
        ...theme.typography.caption,
        color: colors.gray[400],
        marginTop: 12,
    },
    fab: {
        display: 'none',
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    closeCamera: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    flipCamera: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
    },
});
