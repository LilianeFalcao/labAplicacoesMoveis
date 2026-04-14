import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";

export const StudentMonitorLinkingScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);
    const [targetChildId, setTargetChildId] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();

    const [children, setChildren] = useState([
        { id: '1', name: 'Joãozinho Silva', group: 'Berçário A', parent: 'Pedro Silva', status: 'Linked', photo: null as string | null },
        { id: '2', name: 'Mariazinha Santos', group: 'Maternal I', parent: 'Ana Santos', status: 'Linked', photo: null as string | null },
        { id: '3', name: 'Luquinhas Oliveira', group: 'Sem turma', parent: 'Carlos Oliveira', status: 'Pending', photo: null as string | null },
    ]);

    const handleOpenCamera = async (childId: string) => {
        const { granted } = await cameraService.requestPermissions();
        if (granted) {
            setTargetChildId(childId);
            setCameraVisible(true);
        } else {
            Alert.alert("Permissão negada", "O app precisa de acesso à câmera para tirar a foto de perfil.");
        }
    };

    const handleCapture = async () => {
        if (cameraRef.current && targetChildId) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setChildren(prev => prev.map(child =>
                    child.id === targetChildId ? { ...child, photo: photo.uri } : child
                ));
                setCameraVisible(false);
                setTargetChildId(null);
            }
        }
    };

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
                            placeholder="Buscar aluno ou responsável..."
                            placeholderTextColor={Theme.colors.gray[400]}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <MaterialCommunityIcons name="close-circle" size={16} color={Theme.colors.gray[300]} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <FlatList
                    data={children}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Alunos e Responsáveis</Text>
                            <Text style={styles.listSubtitle}>Gerencie os vínculos entre alunos e capture fotos de perfil.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <AppCard style={styles.linkCard}>
                            <View style={styles.cardMain}>
                                <TouchableOpacity
                                    style={styles.avatarCircle}
                                    onPress={() => handleOpenCamera(item.id)}
                                >
                                    {item.photo ? (
                                        <Image source={{ uri: item.photo }} style={styles.childPhoto} />
                                    ) : (
                                        <MaterialCommunityIcons name="camera-plus-outline" size={24} color={Theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                                <View style={styles.infoContent}>
                                    <Text style={styles.childName}>{item.name}</Text>
                                    <View style={styles.parentRow}>
                                        <MaterialCommunityIcons name="account-tie-outline" size={12} color={Theme.colors.gray[400]} />
                                        <Text style={styles.parentName}>{item.parent}</Text>
                                    </View>

                                    <View style={styles.metaRow}>
                                        <View style={[
                                            styles.groupBadge,
                                            item.group === 'Sem turma' ? styles.groupBadgePending : styles.groupBadgeActive
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={item.group === 'Sem turma' ? 'alert-circle-outline' : 'door-open'}
                                                size={10}
                                                color={item.group === 'Sem turma' ? Theme.colors.error : Theme.colors.primary}
                                            />
                                            <Text style={[
                                                styles.groupText,
                                                item.group === 'Sem turma' ? styles.groupTextPending : styles.groupTextActive
                                            ]}>
                                                {item.group}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialCommunityIcons name="link-plus" size={18} color={Theme.colors.primary} />
                                    <Text style={styles.actionBtnText}>Vincular</Text>
                                </TouchableOpacity>
                                <View style={styles.vDivider} />
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialCommunityIcons name="eye-outline" size={18} color={Theme.colors.gray[400]} />
                                </TouchableOpacity>
                            </View>
                        </AppCard>
                    )}
                />
            </View>

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
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    searchSection: {
        padding: Theme.spacing.md,
    },
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
    searchInput: {
        flex: 1,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    listHeader: {
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    listTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    listSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    linkCard: {
        padding: 0,
        marginBottom: Theme.spacing.md,
        overflow: 'hidden',
    },
    cardMain: {
        flexDirection: 'row',
        padding: Theme.spacing.md,
        alignItems: 'center',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
        overflow: 'hidden',
    },
    childPhoto: {
        width: '100%',
        height: '100%',
    },
    infoContent: {
        flex: 1,
    },
    childName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    parentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    parentName: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    groupBadgeActive: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    groupBadgePending: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: Theme.colors.error + '20',
    },
    groupText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    groupTextActive: {
        color: Theme.colors.primary,
    },
    groupTextPending: {
        color: Theme.colors.error,
    },
    actionsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
        backgroundColor: '#F8FAFC',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    actionBtnText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    vDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Theme.colors.gray[200],
        alignSelf: 'center',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});
