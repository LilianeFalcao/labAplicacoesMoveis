import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonitorSummaryCard } from '../../components/monitor/MonitorSummaryCard';
import { TurmaAgendaCard } from '../../components/monitor/TurmaAgendaCard';
// MONITOR_DASHBOARD_DATA has been removed.
import { ClassSelectionModal } from '../../components/monitor/ClassSelectionModal';
import { MockClassRepository } from '../../../infrastructure/activity/repositories/MockClassRepository';
import { MockAccessRequestRepository } from '../../../infrastructure/activity/repositories/MockAccessRequestRepository';
import { GetClassesWithoutMonitorUseCase } from '../../../application/activity/use-cases/GetClassesWithoutMonitorUseCase';
import { RequestTemporaryAccessUseCase } from '../../../application/activity/use-cases/RequestTemporaryAccessUseCase';
import { GetMonitorClassesUseCase } from '../../../application/activity/use-cases/GetMonitorClassesUseCase';
import { GetMonitorAverageAttendanceUseCase } from '../../../application/attendance/use-cases/GetMonitorAverageAttendanceUseCase';
import { MockNotificationRepository } from '../../../infrastructure/notification/repositories/MockNotificationRepository';
import { MockAttendanceRepository } from '../../../infrastructure/attendance/repositories/MockAttendanceRepository';
import { NotificationService } from '../../../infrastructure/notification/services/NotificationService';
import { Alert, Modal } from 'react-native';
import { SpeedDial, SpeedDialAction } from '../../components/base/SpeedDial';
import { IncidentReportModal } from '../../components/monitor/IncidentReportModal';
import { MultiClassNoticeModal } from '../../components/monitor/MultiClassNoticeModal';
import { CameraView, Camera } from 'expo-camera';
import { UploadActivityPhotoUseCase } from '../../../application/activity/use-cases/UploadActivityPhotoUseCase';
import { MockActivityRepository } from '../../../infrastructure/activity/repositories/MockActivityRepository';

export const MonitorHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dynamicAgenda, setDynamicAgenda] = useState<any[]>([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [avgAttendance, setAvgAttendance] = useState('N/A');
    const [isIncidentModalVisible, setIsIncidentModalVisible] = useState(false);
    const [isMultiNoticeModalVisible, setIsMultiNoticeModalVisible] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [monitorClasses, setMonitorClasses] = useState<any[]>([]);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isPhotoSelectionVisible, setIsPhotoSelectionVisible] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');

    // Initialize repositories and use cases
    const notificationRepo = MockNotificationRepository.getInstance();
    const notificationService = NotificationService.getInstance();
    const classRepo = MockClassRepository.getInstance();
    const accessRequestRepo = MockAccessRequestRepository.getInstance();
    const attendanceRepo = MockAttendanceRepository.getInstance();
    const getClassesUseCase = new GetClassesWithoutMonitorUseCase(classRepo);
    const requestAccessUseCase = new RequestTemporaryAccessUseCase(accessRequestRepo);
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

            setDynamicAgenda(newAgendaItems);
        } catch (error) {
            console.error('Failed to load dynamic agenda', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDynamicData();
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
            });

            return () => {
                unsubscribeRequests();
                unsubscribeNotifications();
                unsubscribeAttendance();
            };
        }, [user?.id])
    );

    const handleSendMultiNotice = async (classIds: string[], content: string) => {
        // Mock sending notice
        console.log(`Sending notice to ${classIds.length} classes: ${content}`);
        // In a real app, we would call the SendAnnouncementUseCase here
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
                    caption: 'Captura rápida da Home'
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
            icon: 'alert-circle',
            label: 'Relatar Incidente',
            onPress: () => setIsIncidentModalVisible(true),
            color: Theme.colors.error
        },
        {
            icon: 'camera',
            label: 'Captura Espontânea',
            onPress: handleQuickPhoto,
            color: Theme.colors.primary
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
                    <TouchableOpacity style={styles.headerIcon}>
                        <MaterialCommunityIcons name="menu" size={24} color={Theme.colors.onBackground} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bambolê</Text>
                </View>
                <TouchableOpacity 
                    style={styles.headerIcon} 
                    onPress={() => navigation.navigate('Notifications')}
                >
                    {hasUnreadNotifications && <View style={styles.notificationDot} />}
                    <MaterialCommunityIcons name="bell-outline" size={24} color={Theme.colors.onBackground} />
                </TouchableOpacity>
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
                            <Text style={styles.overtitle}>PAINEL DO MONITOR</Text>
                            <Text style={styles.mainTitle}>Minhas Turmas</Text>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <MonitorSummaryCard
                            label="Turmas Ativas"
                            value={dynamicAgenda.length.toString()}
                            icon="account-group"
                            variant="blue"
                        />
                        <MonitorSummaryCard
                            label="Presença Média"
                            value={avgAttendance}
                            icon="check-decagram"
                            variant="green"
                        />
                    </View>
                </View>

                <View style={styles.agendaSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver tudo</Text>
                        </TouchableOpacity>
                    </View>

                    {dynamicAgenda.map(item => (
                        <TurmaAgendaCard
                            key={item.id}
                            item={item}
                            onAction={() => navigation.navigate('ClassDashboard', { classId: item.id, groupName: item.name })}
                            onPress={() => navigation.navigate('ClassDashboard', { classId: item.id, groupName: item.name })}
                        />
                    ))}
                </View>
            </ScrollView>

            <SpeedDial 
                actions={speedDialActions} 
                bottomOffset={insets.bottom + 16}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.sm,
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
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.error,
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#F8FAFC',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.lg,
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
        color: '#B45309',
        letterSpacing: 1,
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Theme.colors.onBackground,
        lineHeight: 36,
    },
    solicitarBtn: {
        backgroundColor: Theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 4,
        elevation: 4,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        marginLeft: 8,
    },
    solicitarLabel: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
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
        color: Theme.colors.onBackground,
    },
    seeAllText: {
        fontSize: 14,
        color: Theme.colors.primary,
        fontWeight: '700',
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
