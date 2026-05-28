import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { SqliteStorageService } from '../../../infrastructure/storage/SqliteStorageService';
import { ConnectivityService } from '../../../infrastructure/network/ConnectivityService';
import { OfflineSyncService } from '../../../infrastructure/offline/OfflineSyncService';
import { generateUUID } from '../../../infrastructure/utils/uuid';

export interface QuickAddActivityClass {
    id: string;
    name: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    monitorClasses: QuickAddActivityClass[];
    onCreated: () => void;
}

type Category = 'activity' | 'meal' | 'break';

const CATEGORY_OPTIONS: { value: Category; label: string; icon: string; color: string; bg: string }[] = [
    { value: 'activity', label: 'Atividade', icon: 'calendar-clock', color: '#0369A1', bg: '#E0F2FE' },
    { value: 'meal', label: 'Refeição', icon: 'food-fork-drink', color: '#D97706', bg: '#FEF3C7' },
    { value: 'break', label: 'Intervalo', icon: 'coffee', color: '#7C3AED', bg: '#F3E8FF' },
];

export const QuickAddActivityModal: React.FC<Props> = ({ visible, onClose, monitorClasses, onCreated }) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [category, setCategory] = useState<Category>('activity');
    const [selectedClassId, setSelectedClassId] = useState<string>(monitorClasses[0]?.id || '');
    const [loading, setLoading] = useState(false);

    // Validation errors
    const [titleError, setTitleError] = useState('');
    const [timeError, setTimeError] = useState('');

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setCategory('activity');
        setSelectedClassId(monitorClasses[0]?.id || '');
        setTitleError('');
        setTimeError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateTimeFormat = (time: string): boolean => {
        if (!time) return true; // optional — validated separately if needed
        return /^\d{2}:\d{2}$/.test(time);
    };

    const timeToMinutes = (time: string): number => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

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
        if (timeError) setTimeError('');
    };

    const handleEndTimeChange = (text: string) => {
        const formatted = formatTimeInput(text);
        setEndTime(formatted);
        if (timeError) setTimeError('');
    };

    const validate = (): boolean => {
        let valid = true;
        setTitleError('');
        setTimeError('');

        if (!title.trim()) {
            setTitleError('Título é obrigatório');
            valid = false;
        }

        if (!startTime.trim()) {
            setTimeError('Horário de início é obrigatório');
            valid = false;
        } else if (!endTime.trim()) {
            setTimeError('Horário de término é obrigatório');
            valid = false;
        } else if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
            setTimeError('Use o formato HH:MM (ex: 09:30)');
            valid = false;
        } else if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
            setTimeError('Horário de término deve ser após o início');
            valid = false;
        }

        return valid;
    };

    const handleCreate = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const storage = SqliteStorageService.getInstance();
            const id = (globalThis as any).crypto?.randomUUID?.() ?? generateUUID();
            const classId = selectedClassId || monitorClasses[0]?.id;

            if (!classId) {
                Alert.alert('Erro', 'Nenhuma turma selecionada.');
                return;
            }

            const defaultStartTime = startTime.trim();
            const defaultEndTime = endTime.trim();

            // Insert into local SQLite cache
            await storage.run(
                `INSERT INTO class_activities (id, class_id, title, description, start_time, end_time, status, category, synced)
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 0)`,
                [id, classId, title.trim(), description.trim() || null, defaultStartTime, defaultEndTime, category]
            );

            // Enqueue ADD_ACTIVITY for sync
            const payload = JSON.stringify({
                id,
                class_id: classId,
                title: title.trim(),
                description: description.trim() || null,
                start_time: defaultStartTime,
                end_time: defaultEndTime,
                status: 'pending',
                category,
            });

            await storage.run(
                `INSERT INTO sync_queue (action_type, payload, status, retry_count, timestamp)
                 VALUES ('ADD_ACTIVITY', ?, 'pending', 0, ?)`,
                [payload, Date.now()]
            );

            const isOnline = ConnectivityService.getInstance().getStatus() === 'online';

            onCreated();
            handleClose();

            if (isOnline) {
                Alert.alert('✓ Atividade criada!', `"${title.trim()}" foi adicionada à agenda.`);
                const syncService = new OfflineSyncService();
                syncService.syncUp().catch(err => console.error("QuickAddActivityModal auto-sync error:", err));
            } else {
                Alert.alert(
                    'Atividade salva localmente',
                    'Ela será sincronizada automaticamente quando houver conexão.'
                );
            }
        } catch (error: any) {
            console.error('QuickAddActivityModal: create failed', error);
            Alert.alert('Erro', 'Não foi possível salvar a atividade. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleClose}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <View>
                            <Text style={styles.sheetTitle}>Nova Atividade</Text>
                            <Text style={styles.sheetSubtitle}>Salva offline e sincroniza automaticamente</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={20} color={Theme.colors.gray[500]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Title */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Título *</Text>
                            <TextInput
                                style={[styles.input, titleError ? styles.inputError : null]}
                                placeholder="Ex: Oficina de Pintura"
                                placeholderTextColor={Theme.colors.gray[300]}
                                value={title}
                                onChangeText={(t) => { setTitle(t); if (titleError) setTitleError(''); }}
                                maxLength={80}
                            />
                            {!!titleError && <Text style={styles.errorText}>{titleError}</Text>}
                        </View>

                        {/* Description */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                placeholder="Detalhes da atividade..."
                                placeholderTextColor={Theme.colors.gray[300]}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={2}
                                maxLength={200}
                            />
                        </View>

                        {/* Time Range */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Horário *</Text>
                            <View style={styles.timeRow}>
                                <View style={styles.timeInputWrapper}>
                                    <MaterialCommunityIcons name="clock-start" size={16} color={Theme.colors.gray[400]} style={styles.timeIcon} />
                                    <TextInput
                                        style={[styles.input, styles.timeInput, timeError ? styles.inputError : null]}
                                        placeholder="09:00"
                                        placeholderTextColor={Theme.colors.gray[300]}
                                        value={startTime}
                                        onChangeText={handleStartTimeChange}
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>
                                <View style={styles.timeSeparator}>
                                    <Text style={styles.timeSeparatorText}>→</Text>
                                </View>
                                <View style={styles.timeInputWrapper}>
                                    <MaterialCommunityIcons name="clock-end" size={16} color={Theme.colors.gray[400]} style={styles.timeIcon} />
                                    <TextInput
                                        style={[styles.input, styles.timeInput, timeError ? styles.inputError : null]}
                                        placeholder="10:00"
                                        placeholderTextColor={Theme.colors.gray[300]}
                                        value={endTime}
                                        onChangeText={handleEndTimeChange}
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>
                            </View>
                            {!!timeError && <Text style={styles.errorText}>{timeError}</Text>}
                        </View>

                        {/* Category */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Categoria</Text>
                            <View style={styles.categoryRow}>
                                {CATEGORY_OPTIONS.map((opt) => {
                                    const isSelected = category === opt.value;
                                    return (
                                        <TouchableOpacity
                                            key={opt.value}
                                            onPress={() => setCategory(opt.value)}
                                            style={[
                                                styles.categoryChip,
                                                isSelected && { backgroundColor: opt.bg, borderColor: opt.color }
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons
                                                name={opt.icon as any}
                                                size={14}
                                                color={isSelected ? opt.color : Theme.colors.gray[400]}
                                            />
                                            <Text style={[
                                                styles.categoryChipText,
                                                isSelected && { color: opt.color, fontWeight: '700' }
                                            ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Class selector — show only if more than one class */}
                        {monitorClasses.length > 1 && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Turma</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classRow}>
                                    {monitorClasses.map((cls) => {
                                        const isSelected = selectedClassId === cls.id;
                                        return (
                                            <TouchableOpacity
                                                key={cls.id}
                                                onPress={() => setSelectedClassId(cls.id)}
                                                style={[
                                                    styles.classChip,
                                                    isSelected && styles.classChipSelected
                                                ]}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.classChipText,
                                                    isSelected && styles.classChipTextSelected
                                                ]}>
                                                    {cls.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelAction} onPress={handleClose} disabled={loading}>
                            <Text style={styles.cancelActionText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmAction, loading && styles.confirmActionLoading]}
                            onPress={handleCreate}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="calendar-plus" size={18} color="#FFF" />
                                    <Text style={styles.confirmActionText}>Criar Atividade</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        maxHeight: '92%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 20,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Theme.colors.gray[200],
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.onBackground,
    },
    sheetSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Theme.colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldGroup: {
        marginBottom: 16,
    },
    fieldLabel: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.gray[600],
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Theme.colors.gray[50],
        borderWidth: 1.5,
        borderColor: Theme.colors.gray[200],
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: Theme.colors.onBackground,
    },
    inputMultiline: {
        height: 72,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: Theme.colors.error,
    },
    errorText: {
        ...Theme.typography.caption,
        color: Theme.colors.error,
        marginTop: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.gray[50],
        borderWidth: 1.5,
        borderColor: Theme.colors.gray[200],
        borderRadius: 14,
        paddingHorizontal: 10,
    },
    timeIcon: {
        marginRight: 6,
    },
    timeInput: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
    },
    timeSeparator: {
        paddingHorizontal: 4,
    },
    timeSeparatorText: {
        fontSize: 16,
        color: Theme.colors.gray[400],
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Theme.colors.gray[200],
        backgroundColor: Theme.colors.gray[50],
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.colors.gray[500],
    },
    classRow: {
        gap: 8,
        paddingRight: 8,
    },
    classChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Theme.colors.gray[200],
        backgroundColor: Theme.colors.gray[50],
    },
    classChipSelected: {
        backgroundColor: Theme.colors.primary + '15',
        borderColor: Theme.colors.primary,
    },
    classChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.gray[500],
    },
    classChipTextSelected: {
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelAction: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Theme.colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelActionText: {
        ...Theme.typography.body2,
        fontWeight: '700',
        color: Theme.colors.gray[500],
    },
    confirmAction: {
        flex: 2,
        height: 52,
        borderRadius: 16,
        backgroundColor: Theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    confirmActionLoading: {
        opacity: 0.75,
    },
    confirmActionText: {
        ...Theme.typography.body2,
        fontWeight: '700',
        color: '#FFF',
    },
});
