import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";
import { SupabaseChildRepository } from '../../../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseGuardianRepository } from '../../../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { LinkChildToGuardianUseCase } from '../../../application/enrollment/use-cases/LinkChildToGuardianUseCase';
import { supabase } from '../../../infrastructure/supabase/client';
import * as FileSystem from 'expo-file-system';
import { decode } from '../../../infrastructure/utils/base64';

export const StudentMonitorLinkingScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);
    const [targetChildId, setTargetChildId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [guardianEmail, setGuardianEmail] = useState('');
    const [linking, setLinking] = useState(false);

    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();
    const childRepo = new SupabaseChildRepository();
    const guardianRepo = new SupabaseGuardianRepository();
    const linkUseCase = new LinkChildToGuardianUseCase(guardianRepo, childRepo);

    const [children, setChildren] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await childRepo.findAll();
            setChildren(data);
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

    const handleOpenCamera = async (childId: string) => {
        const { granted } = await cameraService.requestPermissions();
        if (granted) {
            setTargetChildId(childId);
            setCameraVisible(true);
        } else {
            Alert.alert("Permissão negada", "O app precisa de acesso à câmera.");
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
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('children-photos')
                .getPublicUrl(fileName);

            const child = await childRepo.findById(childId);
            if (child) {
                const updatedChild = new (child.constructor as any)(
                    child.id,
                    child.name,
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

    const handleLink = async () => {
        if (!guardianEmail.trim()) {
            Alert.alert('Aviso', 'Digite o e-mail do responsável.');
            return;
        }

        setLinking(true);
        try {
            await linkUseCase.execute(guardianEmail.trim(), selectedChild.id);
            Alert.alert('Sucesso', 'Vínculo realizado com sucesso!');
            setIsModalVisible(false);
            setGuardianEmail('');
            loadData();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível realizar o vínculo.');
        } finally {
            setLinking(false);
        }
    };

    const filteredChildren = children.filter(c => 
        c.name.value.toLowerCase().includes(search.toLowerCase())
    );

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
                                <Text style={styles.listSubtitle}>Gerencie os vínculos entre alunos e capture fotos de perfil.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <AppCard style={styles.linkCard}>
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
                                            <MaterialCommunityIcons name="camera-plus-outline" size={24} color={Theme.colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.childName}>{item.name.value}</Text>
                                        <View style={styles.metaRow}>
                                            <View style={[styles.groupBadge, styles.groupBadgeActive]}>
                                                <MaterialCommunityIcons name="door-open" size={10} color={Theme.colors.primary} />
                                                <Text style={[styles.groupText, styles.groupTextActive]}>
                                                    Turma ID: {item.classId || 'Sem turma'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity 
                                        style={styles.actionBtn} 
                                        onPress={() => {
                                            setSelectedChild(item);
                                            setIsModalVisible(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="link-plus" size={18} color={Theme.colors.primary} />
                                        <Text style={styles.actionBtnText}>Vincular Responsável</Text>
                                    </TouchableOpacity>
                                </View>
                            </AppCard>
                        )}
                    />
                )}
            </View>

            {/* Linking Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <AppCard style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Vincular Responsável</Text>
                        <Text style={styles.modalSubtitle}>Aluno: {selectedChild?.name.value}</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="E-mail do responsável"
                            value={guardianEmail}
                            onChangeText={setGuardianEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleLink} disabled={linking}>
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

            <Modal visible={cameraVisible} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} ref={cameraRef}>
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
                                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },
    searchSection: { padding: Theme.spacing.md },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: Theme.spacing.md, height: 48, borderWidth: 1, borderColor: Theme.colors.gray[100], gap: 8 },
    searchInput: { flex: 1, ...Theme.typography.body2, color: Theme.colors.onBackground },
    listContent: { padding: Theme.spacing.md },
    listHeader: { marginBottom: Theme.spacing.md, paddingHorizontal: 4 },
    listTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground },
    listSubtitle: { ...Theme.typography.caption, color: Theme.colors.gray[500], marginTop: 2 },
    linkCard: { padding: 0, marginBottom: Theme.spacing.md, overflow: 'hidden' },
    cardMain: { flexDirection: 'row', padding: Theme.spacing.md, alignItems: 'center' },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md, overflow: 'hidden' },
    childPhoto: { width: '100%', height: '100%' },
    infoContent: { flex: 1 },
    childName: { ...Theme.typography.body1, fontWeight: 'bold', color: Theme.colors.onBackground },
    metaRow: { flexDirection: 'row', marginTop: 8 },
    groupBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    groupBadgeActive: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: Theme.colors.primary + '20' },
    groupText: { fontSize: 10, fontWeight: 'bold' },
    groupTextActive: { color: Theme.colors.primary },
    actionsContainer: { borderTopWidth: 1, borderTopColor: Theme.colors.gray[100], backgroundColor: '#F8FAFC' },
    actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 8 },
    actionBtnText: { ...Theme.typography.caption, color: Theme.colors.primary, fontWeight: 'bold' },
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
    closeButton: { position: 'absolute', top: 40, right: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Theme.spacing.xl },
    modalContent: { padding: Theme.spacing.lg },
    modalTitle: { ...Theme.typography.h3, marginBottom: 8 },
    modalSubtitle: { ...Theme.typography.body2, color: Theme.colors.gray[500], marginBottom: 16 },
    modalInput: { backgroundColor: Theme.colors.gray[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Theme.colors.gray[200], marginBottom: 20 },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, padding: 12, alignItems: 'center' },
    cancelBtnText: { color: Theme.colors.gray[500], fontWeight: '600' },
    confirmBtn: { flex: 1, backgroundColor: Theme.colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontWeight: 'bold' }
});
