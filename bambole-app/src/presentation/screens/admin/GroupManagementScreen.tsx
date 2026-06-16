import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { Class, WeeklySchedule, DayOfWeek } from '../../../domain/activity/entities/Class';
import { supabase } from '../../../infrastructure/supabase/client';

export const GroupManagementScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Class[]>([]);
    const [children, setChildren] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    // Modals
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    // Form inputs
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formAgeRange, setFormAgeRange] = useState('');
    const [formStartTime, setFormStartTime] = useState('08:00');
    const [formEndTime, setFormEndTime] = useState('12:00');
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
    const [saving, setSaving] = useState(false);

    const classRepo = new SupabaseClassRepository();
    const childRepo = new SupabaseChildRepository();

    const DAYS: { label: string; value: DayOfWeek }[] = [
        { label: 'Seg', value: 'MON' },
        { label: 'Ter', value: 'TUE' },
        { label: 'Qua', value: 'WED' },
        { label: 'Qui', value: 'THU' },
        { label: 'Sex', value: 'FRI' },
        { label: 'Sáb', value: 'SAT' },
        { label: 'Dom', value: 'SUN' },
    ];

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch classes
            const allClasses = await classRepo.findAll();
            setClasses(allClasses);

            // 2. Fetch children to calculate live occupancy
            const allChildren = await childRepo.findAll();
            setChildren(allChildren);

            // 3. Fetch monitor assignments
            const { data: acts, error } = await supabase
                .from('monitor_activities')
                .select('class_id, users (full_name)');

            if (error) throw error;
            setAssignments(acts || []);
        } catch (error) {
            console.error('Failed to load classes', error);
            Alert.alert('Erro', 'Não foi possível carregar as turmas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const openCreateModal = () => {
        setEditingClass(null);
        setFormName('');
        setFormDescription('');
        setFormAgeRange('');
        setFormStartTime('08:00');
        setFormEndTime('12:00');
        setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI']);
        setFormModalVisible(true);
    };

    const openEditModal = (cls: Class) => {
        setEditingClass(cls);
        setFormName(cls.name);
        setFormDescription(cls.description || '');
        setFormAgeRange(cls.ageRange || '');
        setFormStartTime(cls.weeklySchedule.startTime);
        setFormEndTime(cls.weeklySchedule.endTime);
        setSelectedDays(cls.weeklySchedule.days);
        setFormModalVisible(true);
    };

    const toggleDay = (day: DayOfWeek) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            Alert.alert('Aviso', 'O nome da turma é obrigatório.');
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert('Aviso', 'Selecione pelo menos um dia da semana.');
            return;
        }

        setSaving(true);
        try {
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            };

            const classId = editingClass ? editingClass.id : generateUUID();
            const schedule = new WeeklySchedule(
                selectedDays,
                formStartTime.trim(),
                formEndTime.trim()
            );

            const newClass = new Class(
                classId,
                formName.trim(),
                schedule,
                formDescription.trim() || undefined,
                formAgeRange.trim() || undefined
            );

            await classRepo.save(newClass);

            Alert.alert('Sucesso', editingClass ? 'Turma atualizada!' : 'Turma criada com sucesso!');
            setFormModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to save class', error);
            Alert.alert('Erro', 'Não foi possível salvar a turma.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClass = (cls: Class) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir a turma ${cls.name}? Alunos vinculados ficarão sem turma associada.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase
                                .from('classes')
                                .delete()
                                .eq('id', cls.id);

                            if (error) throw error;

                            Alert.alert('Sucesso', 'Turma excluída com sucesso.');
                            loadData();
                        } catch (err: any) {
                            console.error('Failed to delete class', err);
                            Alert.alert('Erro', 'Não foi possível excluir a turma.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getStudentsCountForClass = (classId: string) => {
        return children.filter(c => c.classId === classId).length;
    };

    const getMonitorForClass = (classId: string) => {
        const matches = assignments.filter(a => a.class_id === classId);
        if (matches.length === 0) return 'Sem Monitor';
        return matches.map(m => m.users?.full_name || 'Monitor').join(', ');
    };

    const CapacityBar = ({ current, max }: { current: number, max: number }) => {
        const percentage = Math.min((current / max) * 100, 100);
        const isFull = percentage >= 90;

        return (
            <View style={styles.capacityContainer}>
                <View style={styles.capacityHeader}>
                    <Text style={styles.capacityLabel}>Ocupação da Sala</Text>
                    <Text style={[styles.capacityValue, isFull && styles.capacityFull]}>
                        {current}/{max} alunos
                    </Text>
                </View>
                <View style={styles.barBackground}>
                    <View style={[
                        styles.barFill,
                        { width: `${percentage}%` },
                        isFull ? { backgroundColor: Theme.colors.error } : { backgroundColor: Theme.colors.primary }
                    ]} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Gestão de Turmas"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'plus-circle-outline',
                    onPress: openCreateModal
                }}
            />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={classes}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={() => (
                            <View style={styles.headerInfo}>
                                <Text style={styles.headerSubtitle}>Visualize, crie e edite as informações de horários e lotação das turmas.</Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="domain-off" size={60} color={Theme.colors.gray[300]} />
                                <Text style={styles.emptyText}>Nenhuma turma cadastrada.</Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const studentCount = getStudentsCountForClass(item.id);
                            return (
                                <AppCard style={styles.groupCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.titleRow}>
                                            <View style={styles.iconCircle}>
                                                <MaterialCommunityIcons name="domain" size={24} color={Theme.colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.groupName}>{item.name}</Text>
                                                <View style={styles.monitorRow}>
                                                    <MaterialCommunityIcons name="account-tie" size={14} color={Theme.colors.gray[400]} />
                                                    <Text style={styles.monitorName} numberOfLines={1}>
                                                        {getMonitorForClass(item.id)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.scheduleBadge}>
                                            <MaterialCommunityIcons name="clock-outline" size={12} color={Theme.colors.gray[500]} />
                                            <Text style={styles.scheduleText}>
                                                {item.weeklySchedule.startTime} - {item.weeklySchedule.endTime}
                                            </Text>
                                        </View>
                                    </View>

                                    {item.description && (
                                        <Text style={styles.classDescription} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    )}

                                    <View style={styles.divider} />

                                    <CapacityBar current={studentCount} max={20} />

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity style={styles.footerAction} onPress={() => openEditModal(item)}>
                                            <MaterialCommunityIcons name="pencil-outline" size={16} color={Theme.colors.primary} />
                                            <Text style={styles.footerActionText}>Editar</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity style={[styles.footerAction, styles.deleteAction]} onPress={() => handleDeleteClass(item)}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={16} color={Theme.colors.error} />
                                            <Text style={[styles.footerActionText, styles.deleteActionText]}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </AppCard>
                            );
                        }}
                    />
                )}
            </View>

            {/* Create/Edit Class Form Modal */}
            <Modal visible={formModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingClass ? 'Editar Turma' : 'Criar Nova Turma'}
                            </Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <Text style={styles.inputLabel}>Nome da Turma</Text>
                            <TextInput
                                placeholder="Exemplo: Maternal I B, Berçário A..."
                                value={formName}
                                onChangeText={setFormName}
                                style={styles.textInput}
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
                            <TextInput
                                placeholder="Breve descrição da turma e atividades..."
                                value={formDescription}
                                onChangeText={setFormDescription}
                                style={styles.textInput}
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>Faixa Etária (Exemplo: 3-4 anos)</Text>
                            <TextInput
                                placeholder="Exemplo: 2 a 3 anos..."
                                value={formAgeRange}
                                onChangeText={setFormAgeRange}
                                style={styles.textInput}
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>Dias de Aula</Text>
                            <View style={styles.daysContainer}>
                                {DAYS.map(day => {
                                    const isSelected = selectedDays.includes(day.value);
                                    return (
                                        <TouchableOpacity
                                            key={day.value}
                                            style={[
                                                styles.dayChip,
                                                isSelected && styles.dayChipActive
                                            ]}
                                            onPress={() => toggleDay(day.value)}
                                        >
                                            <Text style={[
                                                styles.dayChipText,
                                                isSelected && styles.dayChipTextActive
                                            ]}>
                                                {day.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={styles.timeRow}>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.inputLabel}>Horário de Entrada</Text>
                                    <TextInput
                                        placeholder="08:00"
                                        value={formStartTime}
                                        onChangeText={setFormStartTime}
                                        style={styles.textInput}
                                        maxLength={5}
                                        placeholderTextColor={Theme.colors.gray[400]}
                                    />
                                </View>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.inputLabel}>Horário de Saída</Text>
                                    <TextInput
                                        placeholder="12:00"
                                        value={formEndTime}
                                        onChangeText={setFormEndTime}
                                        style={styles.textInput}
                                        maxLength={5}
                                        placeholderTextColor={Theme.colors.gray[400]}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setFormModalVisible(false)}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    container: {
        flex: 1,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    headerInfo: {
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        lineHeight: 18,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: Theme.spacing.md,
        fontSize: 14,
    },
    groupCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        borderRadius: Theme.borderRadius.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
        flex: 1,
        marginRight: Theme.spacing.sm,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    groupName: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    monitorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    monitorName: {
        fontSize: 12,
        color: Theme.colors.gray[500],
    },
    scheduleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    scheduleText: {
        fontSize: 10,
        color: Theme.colors.gray[600],
        fontWeight: '700',
    },
    classDescription: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        marginTop: Theme.spacing.xs,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: Theme.spacing.md,
    },
    capacityContainer: {
        marginTop: 2,
    },
    capacityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    capacityLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Theme.colors.gray[500],
    },
    capacityValue: {
        fontSize: 12,
        fontWeight: '700',
        color: Theme.colors.gray[600],
    },
    capacityFull: {
        color: Theme.colors.error,
    },
    barBackground: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: Theme.spacing.sm,
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F0F5FA',
        marginLeft: Theme.spacing.sm,
    },
    footerActionText: {
        fontSize: 13,
        fontWeight: '700',
        color: Theme.colors.primary,
        marginLeft: 4,
    },
    deleteAction: {
        backgroundColor: '#FEE2E2',
    },
    deleteActionText: {
        color: Theme.colors.error,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Theme.spacing.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: Theme.spacing.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.onSurface,
    },
    formScroll: {
        marginBottom: Theme.spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.gray[700],
        marginBottom: 6,
        marginTop: Theme.spacing.sm,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 48,
        paddingHorizontal: Theme.spacing.sm,
        fontSize: 16,
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.sm,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginBottom: Theme.spacing.sm,
    },
    dayChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dayChipActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    dayChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.gray[600],
    },
    dayChipTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Theme.spacing.md,
    },
    timeColumn: {
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: Theme.spacing.md,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: Theme.borderRadius.md,
        marginRight: Theme.spacing.sm,
    },
    cancelButtonText: {
        color: Theme.colors.gray[700],
        fontWeight: '700',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        marginLeft: Theme.spacing.sm,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
