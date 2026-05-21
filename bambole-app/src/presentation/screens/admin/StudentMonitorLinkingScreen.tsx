import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    Alert,
    ActivityIndicator,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { ExpoCameraService } from '../../../infrastructure/camera/ExpoCameraService';
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { LinkChildToGuardianUseCase } from '../../../application/enrollment/use-cases/LinkChildToGuardianUseCase';
import { supabase } from '../../../infrastructure/supabase/client';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '../../../infrastructure/utils/base64';

// ─── Types ───────────────────────────────────────────────────────────────────
interface LinkedGuardian {
    id: string;
    fullName: string;
    email: string;
}

interface ParentUser {
    id: string;
    fullName: string;
    email: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const StudentMonitorLinkingScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Search state for student list
    const [search, setSearch] = useState('');

    // Camera state
    const [cameraVisible, setCameraVisible] = useState(false);
    const [targetChildId, setTargetChildId] = useState<string | null>(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [linking, setLinking] = useState(false);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedChild, setSelectedChild] = useState<any>(null);

    // --- Task 1.1: classesMap and guardiansMap state ---
    const [classesMap, setClassesMap] = useState<Record<string, string>>({});
    const [guardiansMap, setGuardiansMap] = useState<Record<string, LinkedGuardian[]>>({});

    // --- Task 3.1 & 3.2: allParents, autocomplete state ---
    const [allParents, setAllParents] = useState<ParentUser[]>([]);
    const [parentSearchQuery, setParentSearchQuery] = useState('');
    const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);
    const [guardianEmail, setGuardianEmail] = useState('');

    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();
    const childRepo = new SupabaseChildRepository();
    const guardianRepo = new SupabaseGuardianRepository();
    const classRepo = new SupabaseClassRepository();
    const linkUseCase = new LinkChildToGuardianUseCase(guardianRepo, childRepo);

    const [children, setChildren] = useState<any[]>([]);

    // --- Task 1.2 & 1.3 & 3.1: loadData fetches classes, guardians and parents ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load children
            const data = await childRepo.findAll();
            setChildren(data);

            // Task 1.2: Fetch all classes and build classesMap
            const allClasses = await classRepo.findAll();
            const cMap: Record<string, string> = {};
            for (const cls of allClasses) {
                cMap[cls.id] = cls.name;
            }
            setClassesMap(cMap);

            // Task 1.3: Fetch guardian_children joined with guardians and user info
            const { data: links, error: linksError } = await supabase
                .from('guardian_children')
                .select(`
                    child_id,
                    guardians (
                        id,
                        users (
                            id,
                            full_name,
                            email
                        )
                    )
                `);

            if (!linksError && links) {
                const gMap: Record<string, LinkedGuardian[]> = {};
                for (const link of links as any[]) {
                    const childId = link.child_id;
                    const guardian = link.guardians;
                    if (guardian && guardian.users) {
                        const user = guardian.users;
                        const entry: LinkedGuardian = {
                            id: guardian.id,
                            fullName: user.full_name || '—',
                            email: user.email || '—',
                        };
                        if (!gMap[childId]) gMap[childId] = [];
                        // Avoid duplicates
                        if (!gMap[childId].find(g => g.id === entry.id)) {
                            gMap[childId].push(entry);
                        }
                    }
                }
                setGuardiansMap(gMap);
            }

            // Task 3.1: Fetch all parent users for autocomplete
            const { data: parents, error: parentsError } = await supabase
                .from('users')
                .select('id, full_name, email')
                .eq('role', 'parent')
                .order('full_name', { ascending: true });

            if (!parentsError && parents) {
                setAllParents(
                    parents.map((p: any) => ({
                        id: p.id,
                        fullName: p.full_name || '—',
                        email: p.email || '—',
                    }))
                );
            }
        } catch (error) {
            console.error('Failed to load children', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de alunos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // --- Task 3.2: Filtered parent suggestions via in-memory search ---
    const parentSuggestions = useMemo<ParentUser[]>(() => {
        if (!parentSearchQuery.trim()) return [];
        const q = parentSearchQuery.toLowerCase();
        return allParents.filter(
            p =>
                p.fullName.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q)
        );
    }, [parentSearchQuery, allParents]);

    // Camera handlers
    const handleOpenCamera = async (childId: string) => {
        const { granted } = await cameraService.requestPermissions();
        if (granted) {
            setTargetChildId(childId);
            setCameraVisible(true);
        } else {
            Alert.alert('Permissão negada', 'O app precisa de acesso à câmera.');
        }
    };

    const handleCapture = async () => {
        if (cameraRef.current && targetChildId) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setCameraVisible(false);
                uploadPhoto(targetChildId, photo.uri);
                setTargetChildId(null);
            }
        }
    };

    const uploadPhoto = async (childId: string, uri: string) => {
        setUploading(childId);
        try {
            const fileName = `child_${childId}_${Date.now()}.jpg`;
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

            const { error: uploadError } = await supabase.storage
                .from('children-photos')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from('children-photos').getPublicUrl(fileName);

            const child = await childRepo.findById(childId);
            if (child) {
                const updatedChild = new (child.constructor as any)(
                    child.id,
                    child.name,
                    child.birthDate,
                    child.classId,
                    publicUrl
                );
                await childRepo.save(updatedChild);
                loadData();
            }
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Erro', 'Falha ao salvar foto do aluno.');
        } finally {
            setUploading(null);
        }
    };

    // --- Task 3.4: handleLink uses guardianEmail (populated by selectedParent selection) ---
    const handleLink = async () => {
        const emailToUse = guardianEmail.trim();
        if (!emailToUse) {
            Alert.alert('Aviso', 'Selecione um responsável na lista de sugestões.');
            return;
        }

        setLinking(true);
        try {
            await linkUseCase.execute(emailToUse, selectedChild.id);
            Alert.alert('Sucesso', 'Vínculo realizado com sucesso!');
            setIsModalVisible(false);
            resetModalState();
            loadData();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível realizar o vínculo.');
        } finally {
            setLinking(false);
        }
    };

    const resetModalState = () => {
        setGuardianEmail('');
        setParentSearchQuery('');
        setSelectedParent(null);
    };

    const handleSelectParent = (parent: ParentUser) => {
        setSelectedParent(parent);
        setGuardianEmail(parent.email);
        setParentSearchQuery(parent.fullName);
    };

    const handleOpenModal = (item: any) => {
        setSelectedChild(item);
        resetModalState();
        setIsModalVisible(true);
    };

    const filteredChildren = children.filter(c =>
        c.name.value.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Vínculos Escolares"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color={Theme.colors.gray[400]} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar aluno..."
                            placeholderTextColor={Theme.colors.gray[400]}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredChildren}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={() => (
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>Alunos</Text>
                                <Text style={styles.listSubtitle}>
                                    Gerencie os vínculos entre alunos e capture fotos de perfil.
                                </Text>
                            </View>
                        )}
                        renderItem={({ item }) => {
                            // Task 2.1: Resolve class name from classesMap
                            const className = item.classId
                                ? classesMap[item.classId] ?? 'Turma desconhecida'
                                : 'Sem turma';

                            // Task 2.2 & 2.3: Resolve linked guardians
                            const linkedGuardians: LinkedGuardian[] = guardiansMap[item.id] ?? [];

                            return (
                                <AppCard style={styles.linkCard}>
                                    {/* Main info row */}
                                    <View style={styles.cardMain}>
                                        <TouchableOpacity
                                            style={styles.avatarCircle}
                                            onPress={() => handleOpenCamera(item.id)}
                                            disabled={uploading === item.id}
                                        >
                                            {uploading === item.id ? (
                                                <ActivityIndicator size="small" color={Theme.colors.primary} />
                                            ) : item.photoUrl ? (
                                                <Image source={{ uri: item.photoUrl }} style={styles.childPhoto} />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="camera-plus-outline"
                                                    size={24}
                                                    color={Theme.colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>

                                        <View style={styles.infoContent}>
                                            <Text style={styles.childName}>{item.name.value}</Text>

                                            {/* Task 2.1: Class name badge */}
                                            <View style={styles.metaRow}>
                                                <View style={[styles.badge, styles.classBadge]}>
                                                    <MaterialCommunityIcons
                                                        name="door-open"
                                                        size={10}
                                                        color={Theme.colors.primary}
                                                    />
                                                    <Text style={[styles.badgeText, styles.classBadgeText]}>
                                                        {className}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Task 2.2 & 2.3: Linked guardians section */}
                                    <View style={styles.guardiansSection}>
                                        <View style={styles.guardiansSectionHeader}>
                                            <MaterialCommunityIcons
                                                name="account-multiple"
                                                size={13}
                                                color={Theme.colors.gray[500]}
                                            />
                                            <Text style={styles.guardiansSectionTitle}>Responsáveis</Text>
                                        </View>

                                        {linkedGuardians.length === 0 ? (
                                            // Task 2.3: No guardians badge
                                            <View style={styles.noGuardianBadge}>
                                                <MaterialCommunityIcons
                                                    name="alert-circle-outline"
                                                    size={13}
                                                    color="#F59E0B"
                                                />
                                                <Text style={styles.noGuardianText}>
                                                    Nenhum responsável vinculado
                                                </Text>
                                            </View>
                                        ) : (
                                            linkedGuardians.map(g => (
                                                <View key={g.id} style={styles.guardianRow}>
                                                    <View style={styles.guardianAvatar}>
                                                        <MaterialCommunityIcons
                                                            name="account-circle"
                                                            size={20}
                                                            color={Theme.colors.primary}
                                                        />
                                                    </View>
                                                    <View style={styles.guardianInfo}>
                                                        <Text style={styles.guardianName}>{g.fullName}</Text>
                                                        <Text style={styles.guardianEmail}>{g.email}</Text>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>

                                    {/* Action button */}
                                    <View style={styles.actionsContainer}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => handleOpenModal(item)}
                                        >
                                            <MaterialCommunityIcons
                                                name="link-plus"
                                                size={18}
                                                color={Theme.colors.primary}
                                            />
                                            <Text style={styles.actionBtnText}>Vincular Responsável</Text>
                                        </TouchableOpacity>
                                    </View>
                                </AppCard>
                            );
                        }}
                    />
                )}
            </View>

            {/* ─── Linking Modal with Autocomplete (Tasks 3.3 & 3.4) ─────────── */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <AppCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Vincular Responsável</Text>
                        <Text style={styles.modalSubtitle}>
                            Aluno: {selectedChild?.name.value}
                        </Text>

                        {/* Task 3.3: Smart search input */}
                        <View style={styles.autocompleteContainer}>
                            <View style={[
                                styles.autocompleteInputRow,
                                selectedParent ? styles.autocompleteInputSelected : null,
                            ]}>
                                <MaterialCommunityIcons
                                    name={selectedParent ? 'account-check' : 'magnify'}
                                    size={18}
                                    color={selectedParent ? '#10B981' : Theme.colors.gray[400]}
                                />
                                <TextInput
                                    style={styles.autocompleteInput}
                                    placeholder="Buscar por nome ou e-mail..."
                                    placeholderTextColor={Theme.colors.gray[400]}
                                    value={parentSearchQuery}
                                    onChangeText={text => {
                                        setParentSearchQuery(text);
                                        // Clear selection if user edits text
                                        if (selectedParent && text !== selectedParent.fullName) {
                                            setSelectedParent(null);
                                            setGuardianEmail('');
                                        }
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {parentSearchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setParentSearchQuery('');
                                            setSelectedParent(null);
                                            setGuardianEmail('');
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="close-circle"
                                            size={16}
                                            color={Theme.colors.gray[400]}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Selected parent confirmation chip */}
                            {selectedParent && (
                                <View style={styles.selectedChip}>
                                    <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                                    <Text style={styles.selectedChipText} numberOfLines={1}>
                                        {selectedParent.fullName} • {selectedParent.email}
                                    </Text>
                                </View>
                            )}

                            {/* Suggestions dropdown */}
                            {parentSuggestions.length > 0 && !selectedParent && (
                                <View style={styles.suggestionsDropdown}>
                                    <ScrollView
                                        keyboardShouldPersistTaps="handled"
                                        nestedScrollEnabled
                                        style={{ maxHeight: 180 }}
                                    >
                                        {parentSuggestions.map((parent, idx) => (
                                            <TouchableOpacity
                                                key={parent.id}
                                                style={[
                                                    styles.suggestionItem,
                                                    idx < parentSuggestions.length - 1 && styles.suggestionItemBorder,
                                                ]}
                                                onPress={() => handleSelectParent(parent)}
                                            >
                                                <View style={styles.suggestionAvatar}>
                                                    <MaterialCommunityIcons
                                                        name="account-circle"
                                                        size={28}
                                                        color={Theme.colors.primary}
                                                    />
                                                </View>
                                                <View style={styles.suggestionTextBlock}>
                                                    <Text style={styles.suggestionName} numberOfLines={1}>
                                                        {parent.fullName}
                                                    </Text>
                                                    <Text style={styles.suggestionEmail} numberOfLines={1}>
                                                        {parent.email}
                                                    </Text>
                                                </View>
                                                <MaterialCommunityIcons
                                                    name="chevron-right"
                                                    size={16}
                                                    color={Theme.colors.gray[300]}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* No results hint */}
                            {parentSearchQuery.trim().length > 0 &&
                                parentSuggestions.length === 0 &&
                                !selectedParent && (
                                    <View style={styles.noResultsHint}>
                                        <MaterialCommunityIcons
                                            name="account-search-outline"
                                            size={16}
                                            color={Theme.colors.gray[400]}
                                        />
                                        <Text style={styles.noResultsText}>
                                            Nenhum responsável encontrado
                                        </Text>
                                    </View>
                                )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    resetModalState();
                                }}
                            >
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmBtn,
                                    !selectedParent && styles.confirmBtnDisabled,
                                ]}
                                onPress={handleLink}
                                disabled={linking || !selectedParent}
                            >
                                {linking ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </AppCard>
                </View>
            </Modal>

            {/* Camera Modal */}
            <Modal visible={cameraVisible} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} ref={cameraRef}>
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setCameraVisible(false)}
                            >
                                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },

    // Search bar
    searchSection: { padding: Theme.spacing.md },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: Theme.spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        gap: 8,
    },
    searchInput: { flex: 1, ...Theme.typography.body2, color: Theme.colors.onBackground },

    // List
    listContent: { padding: Theme.spacing.md },
    listHeader: { marginBottom: Theme.spacing.md, paddingHorizontal: 4 },
    listTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground },
    listSubtitle: { ...Theme.typography.caption, color: Theme.colors.gray[500], marginTop: 2 },

    // Card
    linkCard: { padding: 0, marginBottom: Theme.spacing.md, overflow: 'hidden' },
    cardMain: { flexDirection: 'row', padding: Theme.spacing.md, alignItems: 'center' },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
        overflow: 'hidden',
    },
    childPhoto: { width: '100%', height: '100%' },
    infoContent: { flex: 1 },
    childName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: 6,
    },

    // Badges
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    classBadge: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '30',
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
    classBadgeText: { color: Theme.colors.primary },

    // Guardians section
    guardiansSection: {
        paddingHorizontal: Theme.spacing.md,
        paddingBottom: Theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
        backgroundColor: '#FAFBFC',
    },
    guardiansSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingTop: 10,
        paddingBottom: 6,
    },
    guardiansSectionTitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    guardianRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    guardianAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guardianInfo: { flex: 1 },
    guardianName: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
    guardianEmail: {
        fontSize: 11,
        color: Theme.colors.gray[500],
        marginTop: 1,
    },
    noGuardianBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#FFFBEB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
        marginBottom: 6,
        alignSelf: 'flex-start',
    },
    noGuardianText: {
        fontSize: 11,
        color: '#B45309',
        fontWeight: '600',
    },

    // Action button
    actionsContainer: {
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
        backgroundColor: '#F8FAFC',
    },
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionBtnText: { ...Theme.typography.caption, color: Theme.colors.primary, fontWeight: 'bold' },

    // Camera
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
    closeButton: { position: 'absolute', top: 40, right: 20 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Theme.spacing.xl,
    },
    modalContent: { padding: Theme.spacing.lg },
    modalTitle: { ...Theme.typography.h3, marginBottom: 4, color: Theme.colors.onBackground },
    modalSubtitle: { ...Theme.typography.body2, color: Theme.colors.gray[500], marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 12, alignItems: 'center' },
    cancelBtnText: { color: Theme.colors.gray[500], fontWeight: '600' },
    confirmBtn: {
        flex: 1,
        backgroundColor: Theme.colors.primary,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnDisabled: { backgroundColor: Theme.colors.gray[300] },
    confirmBtnText: { color: '#FFF', fontWeight: 'bold' },

    // Autocomplete
    autocompleteContainer: { position: 'relative' },
    autocompleteInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        gap: 8,
    },
    autocompleteInputSelected: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    autocompleteInput: {
        flex: 1,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        paddingVertical: 10,
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    selectedChipText: {
        fontSize: 12,
        color: '#065F46',
        fontWeight: '600',
        flex: 1,
    },
    suggestionsDropdown: {
        marginTop: 6,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    suggestionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    suggestionAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTextBlock: { flex: 1 },
    suggestionName: {
        fontSize: 13,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
    suggestionEmail: {
        fontSize: 11,
        color: Theme.colors.gray[500],
        marginTop: 1,
    },
    noResultsHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        marginTop: 6,
        backgroundColor: Theme.colors.gray[50],
        borderRadius: 10,
    },
    noResultsText: {
        fontSize: 12,
        color: Theme.colors.gray[400],
    },
});
