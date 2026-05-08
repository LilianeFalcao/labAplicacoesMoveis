import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/base/AppHeader";
import { AppButton } from "../../components/base/AppButton";
import { Theme } from "../../styles/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { CameraView } from "expo-camera";
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";
import { MockActivityRepository } from "../../../infrastructure/activity/repositories/MockActivityRepository";
import { UploadActivityPhotoUseCase } from "../../../application/activity/use-cases/UploadActivityPhotoUseCase";
import { MockClassRepository } from "../../../infrastructure/activity/repositories/MockClassRepository";
import { MockAccessRequestRepository } from "../../../infrastructure/activity/repositories/MockAccessRequestRepository";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ClassDashboardTabsParamList } from "../../navigation/types";

export const PhotoCaptureScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ClassDashboardTabsParamList, 'Photos'>>();
    const { classId } = route.params || {};
    const { user } = useAuth();
    const [image, setImage] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [caption, setCaption] = useState("Atividade registrada pelo monitor");
    const [facing, setFacing] = useState<'front' | 'back'>('back');

    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();

    useFocusEffect(
        useCallback(() => {
            // Context is now provided by parent navigation
        }, [])
    );

    const handleStartCapture = async () => {
        const { granted } = await cameraService.requestPermissions();
        setHasPermission(granted);
        if (granted) {
            setCameraVisible(true);
        } else {
            Alert.alert("Permissão negada", "O app precisa de acesso à câmera.");
        }
    };

    const handleCapture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setImage(photo.uri);
                setCameraVisible(false);
            }
        }
    };

    const handleSave = async () => {
        if (!image) {
            Alert.alert("Erro", "Capture uma foto primeiro.");
            return;
        }

        if (!classId) {
            Alert.alert("Erro", "Turma não identificada.");
            return;
        }

        try {
            const repository = MockActivityRepository.getInstance();
            const useCase = new UploadActivityPhotoUseCase(repository);

            await useCase.execute({
                classId: classId,
                photoUri: image,
                caption: caption,
            });

            // Reset state
            setImage(null);
            setCaption("Atividade registrada pelo monitor");

            Alert.alert(
                "Sucesso",
                "O momento foi compartilhado com os pais!",
                [
                    { text: "Capturar outro", style: "default" },
                    { text: "Sair", onPress: () => navigation.goBack(), style: "cancel" }
                ]
            );
        } catch (error) {
            Alert.alert("Erro", "Não foi possível compartilhar a foto.");
        }
    };

    if (!classId) {
        return (
            <SafeAreaView style={styles.mainContainer} edges={["left", "right", "bottom"]}>
                <AppHeader title="Erro" showBack onBack={() => navigation.goBack()} />
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Erro: Turma não selecionada.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (cameraVisible) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
                            <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.flipButton} 
                            onPress={() => setFacing(prev => prev === 'back' ? 'front' : 'back')}
                        >
                            <MaterialCommunityIcons name="camera-flip" size={30} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.mainContainer} edges={["left", "right", "bottom"]}>
            <AppHeader title="Capturar Momento" showBack onBack={() => navigation.goBack()} />

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

                <View style={[styles.section, styles.captureSection]}>
                    <Text style={styles.sectionTitle}>1. Registre a Atividade</Text>
                    <TouchableOpacity style={[styles.photoCard, !image && styles.photoCardEmpty]} onPress={handleStartCapture} activeOpacity={0.9}>
                        {image ? (
                            <>
                                <Image source={{ uri: image }} style={styles.preview} />
                                <View style={styles.retakeBadge}>
                                    <MaterialCommunityIcons name="refresh" size={16} color="#FFF" />
                                    <Text style={styles.retakeText}>Trocar foto</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons name="camera-plus" size={40} color={Theme.colors.primary} />
                                </View>
                                <Text style={styles.placeholderTitle}>Toque para fotografar</Text>
                                <Text style={styles.placeholderSubtitle}>Compartilhe o progresso da turma</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {image && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Legenda (Opcional)</Text>
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Escreva algo sobre este momento..."
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                        />
                    </View>
                )}

                <AppButton title="Enviar para os Pais" onPress={handleSave} disabled={!image || !classId} style={styles.button} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },
    cameraContainer: { flex: 1, backgroundColor: "#000" },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, backgroundColor: "transparent", justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255, 255, 255, 0.3)", justifyContent: "center", alignItems: "center" },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF" },
    closeButton: { position: "absolute", top: 40, right: 20 },
    flipButton: { position: "absolute", top: 40, left: 20 },
    scrollContent: { padding: Theme.spacing.md },
    section: { marginBottom: Theme.spacing.xl },
    sectionTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground, marginBottom: Theme.spacing.sm },
    classesList: { paddingRight: Theme.spacing.md, gap: 10 },
    classChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Theme.colors.gray[100], borderWidth: 1, borderColor: Theme.colors.gray[200] },
    classChipSelected: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
    classChipText: { ...Theme.typography.body2, color: Theme.colors.onBackground },
    classChipTextSelected: { color: "#FFF", fontWeight: "bold" },
    captureSection: { marginVertical: 0 },
    photoCard: { width: "100%", aspectRatio: 1, borderRadius: 24, backgroundColor: "#FFF", overflow: "hidden", elevation: 4 },
    photoCardEmpty: { borderStyle: "dashed", borderWidth: 2, borderColor: Theme.colors.primary + "40", backgroundColor: "#F0F9FF" },
    preview: { width: "100%", height: "100%" },
    uploadPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", padding: Theme.spacing.xl },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#BAE6FD", justifyContent: "center", alignItems: "center", marginBottom: Theme.spacing.lg },
    placeholderTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground, textAlign: "center" },
    placeholderSubtitle: { ...Theme.typography.body2, color: Theme.colors.gray[500], textAlign: "center", marginTop: 4 },
    retakeBadge: { position: "absolute", bottom: 16, right: 16, backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    retakeText: { ...Theme.typography.caption, color: "#FFF", fontWeight: "bold" },
    captionInput: { backgroundColor: "#FFF", borderRadius: 12, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.gray[200], minHeight: 80, textAlignVertical: "top" },
    button: { marginTop: Theme.spacing.md, height: 56 },
});
