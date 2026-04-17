import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { Class } from '../../../domain/activity/entities/Class';
import { GetClassesWithoutMonitorUseCase } from '../../../application/activity/use-cases/GetClassesWithoutMonitorUseCase';
import { RequestTemporaryAccessUseCase } from '../../../application/activity/use-cases/RequestTemporaryAccessUseCase';

interface ClassSelectionModalProps {
    isVisible: boolean;
    onClose: () => void;
    monitorId: string;
    getClassesUseCase: GetClassesWithoutMonitorUseCase;
    requestAccessUseCase: RequestTemporaryAccessUseCase;
    onSuccess: (className: string) => void;
}

export const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
    isVisible,
    onClose,
    monitorId,
    getClassesUseCase,
    requestAccessUseCase,
    onSuccess
}) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [requesting, setRequesting] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            loadClasses();
        }
    }, [isVisible]);

    const loadClasses = async () => {
        setLoading(true);
        try {
            const data = await getClassesUseCase.execute();
            setClasses(data);
        } catch (error) {
            console.error('Failed to load classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (classId: string, className: string) => {
        setRequesting(classId);
        try {
            await requestAccessUseCase.execute(monitorId, classId);
            onSuccess(className);
            onClose();
        } catch (error) {
            console.error('Failed to request access', error);
        } finally {
            setRequesting(null);
        }
    };

    const renderItem = ({ item }: { item: Class }) => (
        <View style={styles.classItem}>
            <View style={styles.classInfo}>
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.classDetails}>{item.ageRange || 'Faixa etária não informada'}</Text>
                <Text style={styles.classSchedule}>
                    {item.weeklySchedule.days.join(', ')} • {item.weeklySchedule.startTime} - {item.weeklySchedule.endTime}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleRequest(item.id, item.name)}
                disabled={requesting !== null}
            >
                {requesting === item.id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Text style={styles.requestButtonText}>Solicitar</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Solicitar Acesso</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.onBackground} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>Selecione uma turma sem monitor para solicitar acesso temporário.</Text>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                        </View>
                    ) : classes.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>Nenhuma turma disponível no momento.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={classes}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '80%',
        padding: Theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    modalSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginBottom: 24,
    },
    closeButton: {
        padding: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[400],
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    classInfo: {
        flex: 1,
    },
    className: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    classDetails: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    classSchedule: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    requestButton: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    requestButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
