import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CameraView } from 'expo-camera';
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { Child } from '../../../domain/enrollment/entities/Child';
import { ChildName } from '../../../domain/enrollment/value-objects/ChildName';
import { supabase } from '../../../infrastructure/supabase/client';
import { SqliteStorageService } from '../../../infrastructure/storage/SqliteStorageService';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '../../../infrastructure/utils/base64';

export const StudentManagementScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Child[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    
    // Filters
    const [search, setSearch] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

    // Registration/Edit Modals
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editingChild, setEditingChild] = useState<Child | null>(null);
    const [formName, setFormName] = useState('');
    const [formBirthDate, setFormBirthDate] = useState('');
    const [formClassId, setFormClassId] = useState('');
    const [formPhotoUrl, setFormPhotoUrl] = useState<string | null>(null);

    // Date Picker States
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear() - 5);
    const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
    const [pickerDay, setPickerDay] = useState(new Date().getDate());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const openDatePicker = () => {
        if (formBirthDate.trim()) {
            const parts = formBirthDate.trim().split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    setPickerYear(year);
                    setPickerMonth(month);
                    setPickerDay(day);
                    setShowDatePicker(true);
                    return;
                }
            }
        }
        setPickerYear(new Date().getFullYear() - 5);
        setPickerMonth(new Date().getMonth());
        setPickerDay(new Date().getDate());
        setShowDatePicker(true);
    };

    const confirmDatePicker = () => {
        const monthStr = String(pickerMonth + 1).padStart(2, '0');
        const dayStr = String(pickerDay).padStart(2, '0');
        setFormBirthDate(`${pickerYear}-${monthStr}-${dayStr}`);
        setShowDatePicker(false);
    };

    // Camera
    const [cameraVisible, setCameraVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();
    const childRepo = new SupabaseChildRepository();
    const classRepo = new SupabaseClassRepository();
    const sqliteStorage = SqliteStorageService.getInstance();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const allChildren = await childRepo.findAll();
            const allClasses = await classRepo.findAll();
            setChildren(allChildren);
            setClasses(allClasses);
        } catch (error) {
            console.error('Failed to load data', error);
            Alert.alert('Erro', 'Não foi possível carregar as informações.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const openRegisterModal = () => {
        setEditingChild(null);
        setFormName('');
        setFormBirthDate('');
        setFormClassId('');
        setFormPhotoUrl(null);
        setFormModalVisible(true);
    };

    const openEditModal = (child: Child) => {
        setEditingChild(child);
        setFormName(child.name.value);
        setFormBirthDate(child.birthDate ? child.birthDate.toISOString().split('T')[0] : '');
        setFormClassId(child.classId || '');
        setFormPhotoUrl(child.photoUrl || null);
        setFormModalVisible(true);
    };

    const handleOpenCamera = async () => {
        const { granted } = await cameraService.requestPermissions();
        if (granted) {
            setCameraVisible(true);
        } else {
            Alert.alert("Permissão negada", "O aplicativo precisa de permissão de câmera.");
        }
    };

    const handleCapture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setCameraVisible(false);
                uploadPhoto(photo.uri);
            }
        }
    };

    const uploadPhoto = async (uri: string) => {
        setSaving(true);
        try {
            const fileName = `child_${Date.now()}.jpg`;
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            
            const { error: uploadError } = await supabase.storage
                .from('children-photos')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('children-photos')
                .getPublicUrl(fileName);

            setFormPhotoUrl(publicUrl);
            Alert.alert('Sucesso', 'Foto capturada e carregada com sucesso!');
        } catch (error) {
            console.error('Photo upload failed', error);
            Alert.alert('Erro', 'Não foi possível carregar a foto.');
        } finally {
            setSaving(false);
        }
    };

    const validateDate = (dateString: string): boolean => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            Alert.alert('Aviso', 'O nome é obrigatório.');
            return;
        }

        if (formBirthDate.trim() && !validateDate(formBirthDate.trim())) {
            Alert.alert('Erro', 'A data de nascimento deve estar no formato AAAA-MM-DD.');
            return;
        }

        setSaving(true);
        try {
            const birthDate = formBirthDate.trim() ? new Date(formBirthDate.trim()) : undefined;
            const classId = formClassId || null;
            const photoUrl = formPhotoUrl || undefined;

            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            };

            if (editingChild) {
                const updatedChild = new Child(
                    editingChild.id,
                    ChildName.create(formName.trim()),
                    birthDate,
                    classId,
                    photoUrl
                );
                await childRepo.save(updatedChild);
                Alert.alert('Sucesso', 'Dados do aluno atualizados!');
            } else {
                const newChildId = generateUUID();
                const newChild = new Child(
                    newChildId,
                    ChildName.create(formName.trim()),
                    birthDate,
                    classId,
                    photoUrl
                );
                await childRepo.save(newChild);
                Alert.alert('Sucesso', 'Aluno matriculado com sucesso!');
            }

            setFormModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to save child', error);
            Alert.alert('Erro', error.message || 'Erro ao salvar informações.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (child: Child) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir o cadastro de ${child.name.value}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // 1. Delete from remote Supabase
                            const { error } = await supabase
                                .from('children')
                                .delete()
                                .eq('id', child.id);
                            
                            if (error) throw error;

                            // 2. Delete from local cache
                            await sqliteStorage.run('DELETE FROM children WHERE id = ?', [child.id]);

                            Alert.alert('Sucesso', 'Aluno excluído com sucesso.');
                            loadData();
                        } catch (err: any) {
                            console.error('Delete failed', err);
                            Alert.alert('Erro', 'Não foi possível excluir o aluno.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // Filter Logic
    const filteredChildren = children.filter(c => {
        const matchesSearch = c.name.value.toLowerCase().includes(search.toLowerCase());
        const matchesClass = selectedClassFilter === 'ALL' || c.classId === selectedClassFilter;
        return matchesSearch && matchesClass;
    });

    const getClassName = (classId: string | null | undefined) => {
        if (!classId) return 'Sem Turma';
        const cls = classes.find(c => c.id === classId);
        return cls ? cls.name : 'Turma Indefinida';
    };

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Gestão de Crianças"
                showBack
                onBack={() => navigation.goBack()}
            />

            <View style={styles.contentContainer}>
                {/* Search and Filters Section */}
                <View style={styles.filterSection}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color={Theme.colors.gray[400]} />
                        <TextInput
                            placeholder="Buscar aluno por nome..."
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            placeholderTextColor={Theme.colors.gray[400]}
                        />
                    </View>

                    {/* Class Filter Picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                        <TouchableOpacity
                            style={[
                                styles.filterBadge,
                                selectedClassFilter === 'ALL' && styles.filterBadgeActive
                            ]}
                            onPress={() => setSelectedClassFilter('ALL')}
                        >
                            <Text style={[
                                styles.filterBadgeText,
                                selectedClassFilter === 'ALL' && styles.filterBadgeTextActive
                            ]}>
                                Todas as Turmas
                            </Text>
                        </TouchableOpacity>
                        
                        {classes.map(cls => (
                            <TouchableOpacity
                                key={cls.id}
                                style={[
                                    styles.filterBadge,
                                    selectedClassFilter === cls.id && styles.filterBadgeActive
                                ]}
                                onPress={() => setSelectedClassFilter(cls.id)}
                            >
                                <Text style={[
                                    styles.filterBadgeText,
                                    selectedClassFilter === cls.id && styles.filterBadgeTextActive
                                ]}>
                                    {cls.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Add Child Floating/Fixed button */}
                <TouchableOpacity style={styles.addButton} onPress={openRegisterModal}>
                    <MaterialCommunityIcons name="plus" size={20} color={Theme.colors.onPrimary} />
                    <Text style={styles.addButtonText}>Matricular Nova Criança</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredChildren}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="face-recognition" size={60} color={Theme.colors.gray[300]} />
                                <Text style={styles.emptyText}>Nenhuma criança cadastrada nesta visualização.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <AppCard style={styles.childCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatarContainer}>
                                        {item.photoUrl ? (
                                            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <MaterialCommunityIcons name="account" size={32} color={Theme.colors.gray[400]} />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.childName}>{item.name.value}</Text>
                                        <View style={styles.badgeRow}>
                                            <View style={styles.classBadge}>
                                                <Text style={styles.classBadgeText}>{getClassName(item.classId)}</Text>
                                            </View>
                                            {item.birthDate && (
                                                <Text style={styles.birthDateText}>
                                                    Nasc: {item.birthDate.toLocaleDateString('pt-BR')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                                        <MaterialCommunityIcons name="pencil-outline" size={16} color={Theme.colors.primary} />
                                        <Text style={styles.actionButtonText}>Editar</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={16} color={Theme.colors.error} />
                                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
                                    </TouchableOpacity>
                                </View>
                            </AppCard>
                        )}
                    />
                )}
            </View>

            {/* Registration & Edit Form Modal */}
            <Modal visible={formModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingChild ? 'Editar Aluno' : 'Matricular Criança'}
                            </Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            {/* Photo capture block */}
                            <View style={styles.photoUploadContainer}>
                                {formPhotoUrl ? (
                                    <Image source={{ uri: formPhotoUrl }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.previewPlaceholder}>
                                        <MaterialCommunityIcons name="camera-enhance" size={40} color={Theme.colors.gray[300]} />
                                        <Text style={styles.previewPlaceholderText}>Sem Foto de Perfil</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.photoButton} onPress={handleOpenCamera}>
                                    <MaterialCommunityIcons name="camera" size={16} color={Theme.colors.onPrimary} />
                                    <Text style={styles.photoButtonText}>Tirar Foto do Aluno</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Nome Completo</Text>
                            <TextInput
                                placeholder="Digite o nome completo da criança..."
                                value={formName}
                                onChangeText={setFormName}
                                style={styles.textInput}
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>Data de Nascimento</Text>
                            <TouchableOpacity
                                style={styles.datePickerTriggerBtn}
                                onPress={openDatePicker}
                                activeOpacity={0.7}
                            >
                                <Text style={formBirthDate ? styles.datePickerTriggerText : styles.datePickerTriggerPlaceholder}>
                                    {formBirthDate ? formBirthDate : 'Selecionar data de nascimento...'}
                                </Text>
                                <MaterialCommunityIcons name="calendar" size={20} color={Theme.colors.gray[400]} />
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Associar à Turma</Text>
                            <View style={styles.pickerWrapper}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <TouchableOpacity
                                        style={[
                                            styles.classOption,
                                            formClassId === '' && styles.classOptionActive
                                        ]}
                                        onPress={() => setFormClassId('')}
                                    >
                                        <Text style={[
                                            styles.classOptionText,
                                            formClassId === '' && styles.classOptionTextActive
                                        ]}>Sem Turma</Text>
                                    </TouchableOpacity>
                                    
                                    {classes.map(cls => (
                                        <TouchableOpacity
                                            key={cls.id}
                                            style={[
                                                styles.classOption,
                                                formClassId === cls.id && styles.classOptionActive
                                            ]}
                                            onPress={() => setFormClassId(cls.id)}
                                        >
                                            <Text style={[
                                                styles.classOptionText,
                                                formClassId === cls.id && styles.classOptionTextActive
                                            ]}>{cls.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
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
            </Modal>

            {/* Seletor de Data de Nascimento (Custom Calendar Modal) */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.pickerModalOverlay}>
                    <View style={styles.pickerModalContainer}>
                        <Text style={styles.pickerModalTitle}>Data de Nascimento</Text>
                        
                        {/* 1. SELETOR RÁPIDO DE ANO */}
                        <Text style={styles.pickerSectionLabel}>Selecionar Ano</Text>
                        <View style={styles.yearScrollContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScrollContent}>
                                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 12 + i).map((yr) => (
                                    <TouchableOpacity
                                        key={yr}
                                        style={[
                                            styles.yearChip,
                                            pickerYear === yr && styles.yearChipActive
                                        ]}
                                        onPress={() => setPickerYear(yr)}
                                    >
                                        <Text style={[
                                            styles.yearChipText,
                                            pickerYear === yr && styles.yearChipTextActive
                                        ]}>{yr}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* 2. SELETOR RÁPIDO DE MÊS */}
                        <Text style={styles.pickerSectionLabel}>Selecionar Mês</Text>
                        <View style={styles.monthGrid}>
                            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mon, index) => (
                                <TouchableOpacity
                                    key={mon}
                                    style={[
                                        styles.monthCard,
                                        pickerMonth === index && styles.monthCardActive
                                    ]}
                                    onPress={() => setPickerMonth(index)}
                                >
                                    <Text style={[
                                        styles.monthCardText,
                                        pickerMonth === index && styles.monthCardTextActive
                                    ]}>{mon}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 3. GRADE DE DIAS */}
                        <View style={styles.monthHeaderRow}>
                            <Text style={styles.activeMonthLabel}>
                                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][pickerMonth]} de {pickerYear}
                            </Text>
                        </View>

                        {/* Weekday headers */}
                        <View style={styles.weekdayHeaderRow}>
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, i) => (
                                <Text key={i} style={styles.weekdayHeaderText}>{wd}</Text>
                            ))}
                        </View>

                        {/* Days Grid */}
                        <View style={styles.daysGrid}>
                            {(() => {
                                const dayViews = [];
                                const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
                                const firstDay = getFirstDayOfMonth(pickerYear, pickerMonth);

                                // Empty cells before first day
                                for (let i = 0; i < firstDay; i++) {
                                    dayViews.push(<View key={`empty-${i}`} style={styles.dayCellEmpty} />);
                                }

                                // Day cells
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const isSelected = pickerDay === d;
                                    dayViews.push(
                                        <TouchableOpacity
                                            key={`day-${d}`}
                                            style={[
                                                styles.dayCell,
                                                isSelected && styles.dayCellActive
                                            ]}
                                            onPress={() => setPickerDay(d)}
                                        >
                                            <Text style={[
                                                styles.dayCellText,
                                                isSelected && styles.dayCellTextActive
                                            ]}>{d}</Text>
                                        </TouchableOpacity>
                                    );
                                }
                                return dayViews;
                            })()}
                        </View>

                        {/* Actions Footer */}
                        <View style={styles.pickerModalActions}>
                            <TouchableOpacity
                                style={styles.pickerCancelButton}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.pickerCancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.pickerConfirmButton}
                                onPress={confirmDatePicker}
                            >
                                <Text style={styles.pickerConfirmButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Camera View Modal */}
            <Modal visible={cameraVisible} animationType="fade">
                <SafeAreaView style={styles.cameraContainer}>
                    <CameraView ref={cameraRef} style={StyleSheet.absoluteFill}>
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity
                                style={styles.closeCameraBtn}
                                onPress={() => setCameraVisible(false)}
                            >
                                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                            </TouchableOpacity>

                            <View style={styles.cameraControls}>
                                <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                                    <View style={styles.captureBtnInner} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    contentContainer: {
        flex: 1,
        padding: Theme.spacing.md,
    },
    filterSection: {
        backgroundColor: '#FFF',
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: Theme.borderRadius.md,
        paddingHorizontal: Theme.spacing.sm,
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: Theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: Theme.spacing.sm,
        color: Theme.colors.onBackground,
        fontSize: 16,
    },
    pickerScroll: {
        flexDirection: 'row',
        marginTop: Theme.spacing.xs,
    },
    filterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterBadgeActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    filterBadgeText: {
        color: Theme.colors.gray[600],
        fontSize: 12,
        fontWeight: '600',
    },
    filterBadgeTextActive: {
        color: '#FFF',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        height: 48,
        marginBottom: Theme.spacing.md,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: Theme.spacing.sm,
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: Theme.spacing.md,
        fontSize: 14,
    },
    childCard: {
        marginBottom: Theme.spacing.sm,
        padding: Theme.spacing.md,
        borderRadius: Theme.borderRadius.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: Theme.spacing.md,
    },
    childName: {
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.onSurface,
        marginBottom: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    classBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: Theme.spacing.sm,
    },
    classBadgeText: {
        color: '#0369A1',
        fontSize: 11,
        fontWeight: '700',
    },
    birthDateText: {
        fontSize: 12,
        color: Theme.colors.gray[500],
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: Theme.spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F0F5FA',
        marginLeft: Theme.spacing.sm,
    },
    actionButtonText: {
        color: Theme.colors.primary,
        fontWeight: '700',
        fontSize: 13,
        marginLeft: 4,
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    deleteButtonText: {
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
    photoUploadContainer: {
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: Theme.spacing.sm,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
    },
    previewPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.sm,
    },
    previewPlaceholderText: {
        fontSize: 10,
        color: Theme.colors.gray[400],
        marginTop: 4,
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
    },
    photoButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
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
    },
    pickerWrapper: {
        marginTop: 4,
        marginBottom: Theme.spacing.md,
    },
    classOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    classOptionActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    classOptionText: {
        color: Theme.colors.gray[600],
        fontWeight: '600',
        fontSize: 13,
    },
    classOptionTextActive: {
        color: '#FFF',
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
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
    },
    closeCameraBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraControls: {
        marginBottom: 30,
        alignItems: 'center',
    },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#FFF',
    },
    pickerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.md,
    },
    pickerModalContainer: {
        backgroundColor: '#FFF',
        borderRadius: Theme.borderRadius.xl,
        padding: Theme.spacing.lg,
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 8,
    },
    pickerModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.gray[800],
        marginBottom: Theme.spacing.md,
        textAlign: 'center',
    },
    pickerSectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.gray[500],
        marginBottom: Theme.spacing.xs,
        marginTop: Theme.spacing.sm,
    },
    yearScrollContainer: {
        marginBottom: Theme.spacing.xs,
    },
    yearScrollContent: {
        paddingVertical: 2,
    },
    yearChip: {
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.xs,
        backgroundColor: Theme.colors.gray[100],
        borderRadius: Theme.borderRadius.full,
        marginRight: Theme.spacing.xs,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    yearChipActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    yearChipText: {
        fontSize: 14,
        color: Theme.colors.gray[700],
        fontWeight: '500',
    },
    yearChipTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.xs,
    },
    monthCard: {
        width: '23%',
        paddingVertical: Theme.spacing.xs,
        backgroundColor: '#F8FAFC',
        borderRadius: Theme.borderRadius.md,
        alignItems: 'center',
        marginVertical: 4,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    monthCardActive: {
        backgroundColor: Theme.colors.secondary,
        borderColor: Theme.colors.secondary,
    },
    monthCardText: {
        fontSize: 12,
        color: Theme.colors.gray[700],
        fontWeight: '600',
    },
    monthCardTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
    monthHeaderRow: {
        alignItems: 'center',
        marginVertical: Theme.spacing.sm,
    },
    activeMonthLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.primary,
    },
    weekdayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    weekdayHeaderText: {
        width: '13%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: Theme.colors.gray[400],
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: Theme.spacing.md,
    },
    dayCell: {
        width: '13%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Theme.borderRadius.full,
        marginVertical: 2,
    },
    dayCellActive: {
        backgroundColor: Theme.colors.primary,
    },
    dayCellEmpty: {
        width: '13%',
        aspectRatio: 1,
    },
    dayCellText: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.gray[700],
    },
    dayCellTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
    pickerModalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.xs,
    },
    pickerCancelButton: {
        flex: 1,
        paddingVertical: Theme.spacing.md,
        borderRadius: Theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        alignItems: 'center',
        marginRight: Theme.spacing.sm,
    },
    pickerCancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.gray[600],
    },
    pickerConfirmButton: {
        flex: 1,
        paddingVertical: Theme.spacing.md,
        borderRadius: Theme.borderRadius.lg,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
    },
    pickerConfirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    datePickerTriggerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.borderRadius.lg,
        paddingHorizontal: Theme.spacing.md,
        height: 50,
        marginBottom: Theme.spacing.md,
        justifyContent: 'space-between',
    },
    datePickerTriggerText: {
        fontSize: 15,
        color: Theme.colors.gray[700],
    },
    datePickerTriggerPlaceholder: {
        fontSize: 15,
        color: Theme.colors.gray[400],
    },
});
