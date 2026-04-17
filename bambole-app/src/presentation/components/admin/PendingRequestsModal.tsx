import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppCard } from '../base/AppCard';
import { ClassAccessRequest } from '../../../domain/activity/entities/ClassAccessRequest';
import { GetPendingAccessRequestsUseCase } from '../../../application/activity/use-cases/GetPendingAccessRequestsUseCase';
import { ApproveAccessRequestUseCase } from '../../../application/activity/use-cases/ApproveAccessRequestUseCase';

interface PendingRequestsModalProps {
    isVisible: boolean;
    onClose: () => void;
    accessRepo: any;
    classRepo: any;
}

export const PendingRequestsModal: React.FC<PendingRequestsModalProps> = ({
    isVisible,
    onClose,
    accessRepo,
    classRepo
}) => {
    const [requests, setRequests] = useState<ClassAccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const getPendingUseCase = new GetPendingAccessRequestsUseCase(accessRepo);
    const approveUseCase = new ApproveAccessRequestUseCase(accessRepo, classRepo);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await getPendingUseCase.execute();
            setRequests(data);
        } catch (error) {
            console.error('Failed to load pending requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            loadRequests();
        }
    }, [isVisible]);

    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            await approveUseCase.execute(id);
            Alert.alert('Sucesso', 'Solicitação aprovada com sucesso!');
            loadRequests();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível aprovar a solicitação.');
        } finally {
            setProcessing(null);
        }
    };

    const renderItem = ({ item }: { item: ClassAccessRequest }) => (
        <AppCard style={styles.requestCard}>
            <View style={styles.requestInfo}>
                <View style={[styles.iconBox, { backgroundColor: Theme.colors.primary + '15' }]}>
                    <MaterialCommunityIcons name="account-clock" size={24} color={Theme.colors.primary} />
                </View>
                <View style={styles.textDetails}>
                    <Text style={styles.monitorText}>ID do Monitor: {item.monitorId}</Text>
                    <Text style={styles.classText}>ID da Turma: {item.classId}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item.id || '')}
                disabled={processing !== null}
            >
                {processing === item.id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                )}
            </TouchableOpacity>
        </AppCard>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.headerTitleContainer}>
                            <MaterialCommunityIcons name="account-key-outline" size={24} color={Theme.colors.primary} />
                            <Text style={styles.modalTitle}>Solicitações Pendentes</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[400]} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={requests}
                            keyExtractor={item => item.id || Math.random().toString()}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={() => (
                                <View style={styles.center}>
                                    <MaterialCommunityIcons name="check-decagram-outline" size={48} color={Theme.colors.gray[300]} />
                                    <Text style={styles.emptyText}>Tudo em dia!{'\n'}Nenhuma solicitação pendente.</Text>
                                </View>
                            )}
                        />
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '70%',
        paddingTop: Theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        marginBottom: Theme.spacing.lg,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    closeBtn: {
        padding: 4,
    },
    listContent: {
        padding: Theme.spacing.md,
        paddingBottom: 40,
    },
    requestCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    textDetails: {
        flex: 1,
    },
    monitorText: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    classText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
    },
    approveBtn: {
        backgroundColor: Theme.colors.success,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
});
