import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { AppInput } from '../../components/base/AppInput';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ClassDashboardTabsParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SupabaseAgendaRepository } from '@/infrastructure/activity/repositories/SupabaseAgendaRepository';
import { ClassActivity } from '@/domain/activity/repositories/IAgendaRepository';
import { generateUUID } from '@/infrastructure/utils/uuid';

type GroupAgendaNavigationProp = BottomTabNavigationProp<ClassDashboardTabsParamList, 'Agenda'>;
type GroupAgendaRouteProp = RouteProp<ClassDashboardTabsParamList, 'Agenda'>;

const categoryConfig = {
    activity: {
        label: 'Atividade',
        backgroundColor: Theme.colors.primary + '15',
        color: Theme.colors.primary,
    },
    meal: {
        label: 'Refeição',
        backgroundColor: '#EAB30815',
        color: '#CA8A04',
    },
    break: {
        label: 'Intervalo',
        backgroundColor: '#F9731615',
        color: '#EA580C',
    },
};

export const GroupAgendaScreen = () => {
    const navigation = useNavigation<GroupAgendaNavigationProp>();
    const route = useRoute<GroupAgendaRouteProp>();
    const insets = useSafeAreaInsets();
    const { classId, groupName = 'Turma' } = route.params || {};

    const [agendaItems, setAgendaItems] = React.useState<ClassActivity[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Modal and Form local state
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [startTime, setStartTime] = React.useState('');
    const [endTime, setEndTime] = React.useState('');
    const [category, setCategory] = React.useState<'activity' | 'break' | 'meal'>('activity');
    const [formErrors, setFormErrors] = React.useState<{ title?: string; startTime?: string; endTime?: string }>({});

    const loadAgenda = React.useCallback(async () => {
        if (!classId) return;
        const repo = SupabaseAgendaRepository.getInstance();
        const data = await repo.findByClass(classId);
        setAgendaItems(data);
        setLoading(false);
    }, [classId]);

    React.useEffect(() => {
        loadAgenda();
    }, [loadAgenda]);

    const formatTimeInput = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 2) {
            return cleaned;
        }
        return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    };

    const handleStartTimeChange = (text: string) => {
        const formatted = formatTimeInput(text);
        setStartTime(formatted);
        if (formErrors.startTime) {
            setFormErrors(prev => ({ ...prev, startTime: undefined }));
        }
    };

    const handleEndTimeChange = (text: string) => {
        const formatted = formatTimeInput(text);
        setEndTime(formatted);
        if (formErrors.endTime) {
            setFormErrors(prev => ({ ...prev, endTime: undefined }));
        }
    };

    const handleAddActivity = async () => {
        let hasError = false;
        const errors: { title?: string; startTime?: string; endTime?: string } = {};

        if (!title.trim()) {
            errors.title = 'Título é obrigatório';
            hasError = true;
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!startTime.trim()) {
            errors.startTime = 'Obrigatório';
            hasError = true;
        } else if (!timeRegex.test(startTime)) {
            errors.startTime = 'Formato HH:MM';
            hasError = true;
        }

        if (!endTime.trim()) {
            errors.endTime = 'Obrigatório';
            hasError = true;
        } else if (!timeRegex.test(endTime)) {
            errors.endTime = 'Formato HH:MM';
            hasError = true;
        }

        if (hasError) {
            setFormErrors(errors);
            return;
        }

        try {
            const repo = SupabaseAgendaRepository.getInstance();
            const newActivity: ClassActivity = {
                id: generateUUID(),
                classId: classId || '101',
                startTime,
                endTime,
                title: title.trim(),
                description: description.trim() || undefined,
                status: 'pending',
                category,
            };

            await repo.save(newActivity);
            
            // Clear inputs
            setIsModalVisible(false);
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setCategory('activity');
            setFormErrors({});

            Alert.alert('Sucesso', 'Atividade adicionada com sucesso!');
            loadAgenda();
        } catch (error) {
            Alert.alert('Erro', 'Houve um erro ao salvar a atividade.');
        }
    };

    const renderAgendaItem = ({ item }: { item: ClassActivity }) => {
        const isCompleted = item.status === 'completed';
        const isOngoing = item.status === 'ongoing';
        const config = categoryConfig[item.category] || {
            label: item.category,
            backgroundColor: Theme.colors.gray[100],
            color: Theme.colors.gray[500],
        };

        return (
            <AppCard style={styles.agendaCard}>
                <View style={styles.agendaHeader}>
                    <View style={[
                        styles.timeTag, 
                        { backgroundColor: isCompleted ? Theme.colors.success + '20' : isOngoing ? Theme.colors.info + '20' : Theme.colors.primary + '20' }
                    ]}>
                        <Text style={[
                            styles.timeText, 
                            { color: isCompleted ? Theme.colors.success : isOngoing ? Theme.colors.info : Theme.colors.primary }
                        ]}>
                            {item.startTime} - {item.endTime}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={async () => {
                        const newStatus = isCompleted ? 'pending' : 'completed';
                        await SupabaseAgendaRepository.getInstance().updateStatus(item.id, newStatus);
                        loadAgenda();
                    }}>
                        <MaterialCommunityIcons 
                            name={isCompleted ? "checkbox-marked-circle" : isOngoing ? "play-circle-outline" : "checkbox-blank-circle-outline"} 
                            size={24} 
                            color={isCompleted ? Theme.colors.success : isOngoing ? Theme.colors.info : Theme.colors.gray[300]} 
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                {item.description && <Text style={styles.activityDesc}>{item.description}</Text>}
                <View style={styles.agendaFooter}>
                    <View style={[styles.categoryBadge, { backgroundColor: config.backgroundColor }]}>
                        <Text style={[styles.categoryText, { color: config.color }]}>{config.label}</Text>
                    </View>
                    {isOngoing && (
                        <View style={[styles.categoryBadge, { marginLeft: 8, backgroundColor: Theme.colors.info + '20' }]}>
                            <Text style={[styles.categoryText, { color: Theme.colors.info }]}>Em andamento</Text>
                        </View>
                    )}
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AppHeader 
                title={`Agenda: ${groupName}`} 
                showBack 
                onBack={() => navigation.goBack()}
            />
            
            <FlatList
                data={agendaItems}
                renderItem={renderAgendaItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={64} color={Theme.colors.gray[200]} />
                            <Text style={styles.emptyText}>Nenhuma atividade cadastrada para hoje. Cadastre atividades clicando no botão "+" abaixo.</Text>
                        </View>
                    ) : null
                }
            />

            <TouchableOpacity 
                style={[styles.fab, { bottom: insets.bottom + 20 }]}
                onPress={() => setIsModalVisible(true)}
            >
                <MaterialCommunityIcons name="plus" size={30} color="white" />
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        style={styles.modalDismissArea}
                        activeOpacity={1}
                        onPress={() => setIsModalVisible(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalDragHandle} />
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitle}>Nova Atividade</Text>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[500]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalFormScroll}>
                            <AppInput
                                label="Título da Atividade"
                                placeholder="Ex: Roda de Leitura, Gincana"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    if (formErrors.title) {
                                        setFormErrors(prev => ({ ...prev, title: undefined }));
                                    }
                                }}
                                error={formErrors.title}
                                leftIcon="lead-pencil"
                            />

                            <AppInput
                                label="Descrição (Opcional)"
                                placeholder="Detalhes ou observações sobre a atividade"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 80, textAlignVertical: 'top' }}
                                leftIcon="text"
                            />

                            <View style={styles.timeFieldsRow}>
                                <View style={{ flex: 1, marginRight: Theme.spacing.md }}>
                                    <AppInput
                                        label="Hora Início"
                                        placeholder="08:00"
                                        value={startTime}
                                        onChangeText={handleStartTimeChange}
                                        error={formErrors.startTime}
                                        maxLength={5}
                                        keyboardType="numeric"
                                        leftIcon="clock-outline"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppInput
                                        label="Hora Término"
                                        placeholder="09:00"
                                        value={endTime}
                                        onChangeText={handleEndTimeChange}
                                        error={formErrors.endTime}
                                        maxLength={5}
                                        keyboardType="numeric"
                                        leftIcon="clock-outline"
                                    />
                                </View>
                            </View>

                            <View style={styles.categorySelectorContainer}>
                                <Text style={styles.fieldLabel}>Categoria</Text>
                                <View style={styles.categorySelectorRow}>
                                    {(['activity', 'meal', 'break'] as const).map((cat) => {
                                        const isSelected = category === cat;
                                        const config = categoryConfig[cat];
                                        let iconName: 'run' | 'food' | 'coffee' = 'run';
                                        if (cat === 'meal') iconName = 'food';
                                        if (cat === 'break') iconName = 'coffee';

                                        return (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat)}
                                                style={[
                                                    styles.categorySelectorBtn,
                                                    isSelected && {
                                                        backgroundColor: config.backgroundColor,
                                                        borderColor: config.color,
                                                        borderWidth: 1.5,
                                                    },
                                                ]}
                                            >
                                                <MaterialCommunityIcons
                                                    name={iconName}
                                                    size={18}
                                                    color={isSelected ? config.color : Theme.colors.gray[400]}
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text
                                                    style={[
                                                        styles.categorySelectorText,
                                                        { color: isSelected ? config.color : Theme.colors.gray[600] },
                                                    ]}
                                                >
                                                    {config.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <AppButton
                                title="Salvar Atividade"
                                onPress={handleAddActivity}
                                style={styles.saveBtn}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    listContent: {
        padding: Theme.spacing.lg,
    },
    agendaCard: {
        padding: 16,
        marginBottom: 16,
    },
    agendaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
    },
    activityTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginBottom: 4,
    },
    activityDesc: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginBottom: 12,
    },
    agendaFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[400],
        marginTop: 16,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalDismissArea: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: Theme.colors.onPrimary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    modalDragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Theme.colors.gray[300],
        marginBottom: 8,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: Theme.spacing.lg,
    },
    modalTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    modalFormScroll: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.xl,
    },
    timeFieldsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categorySelectorContainer: {
        marginBottom: Theme.spacing.lg,
    },
    fieldLabel: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[700],
        marginBottom: Theme.spacing.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categorySelectorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    categorySelectorBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.gray[50],
        borderColor: Theme.colors.gray[200],
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: Theme.spacing.md,
        paddingHorizontal: 8,
    },
    categorySelectorText: {
        ...Theme.typography.caption,
        fontWeight: '700',
    },
    saveBtn: {
        marginTop: Theme.spacing.md,
    },
});
