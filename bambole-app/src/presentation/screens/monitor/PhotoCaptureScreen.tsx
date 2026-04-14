import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/base/AppHeader";
import { AppButton } from "../../components/base/AppButton";
import { Theme } from "../../styles/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CameraView } from "expo-camera";
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";

export const PhotoCaptureScreen = () => {
    const navigation = useNavigation();
    const [image, setImage] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();

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

    const handleSave = () => {
        if (!image) {
            Alert.alert("Erro", "Capture uma foto primeiro.");
            return;
        }
        Alert.alert("Sucesso", "O momento foi compartilhado com os pais!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    };

    if (cameraVisible) {
        return (
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
        );
    }

    return (
        <SafeAreaView style={styles.mainContainer} edges={["left", "right", "bottom"]}>
            <AppHeader title="Capturar Momento" showBack onBack={() => navigation.goBack()} />

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.captureSection}>
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
                                <Text style={styles.placeholderSubtitle}>Registre um momento especial da turma</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <AppButton title="Compartilhar com os Pais" onPress={handleSave} disabled={!image} style={styles.button} />
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
    scrollContent: { padding: Theme.spacing.md },
    captureSection: { marginVertical: Theme.spacing.md },
    photoCard: { width: "100%", aspectRatio: 1, borderRadius: 24, backgroundColor: "#FFF", overflow: "hidden", elevation: 4 },
    photoCardEmpty: { borderStyle: "dashed", borderWidth: 2, borderColor: Theme.colors.primary + "40", backgroundColor: "#F0F9FF" },
    preview: { width: "100%", height: "100%" },
    uploadPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", padding: Theme.spacing.xl },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#BAE6FD", justifyContent: "center", alignItems: "center", marginBottom: Theme.spacing.lg },
    placeholderTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground, textAlign: "center" },
    placeholderSubtitle: { ...Theme.typography.body2, color: Theme.colors.gray[500], textAlign: "center", marginTop: 4 },
    retakeBadge: { position: "absolute", bottom: 16, right: 16, backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    retakeText: { ...Theme.typography.caption, color: "#FFF", fontWeight: "bold" },
    button: { marginTop: Theme.spacing.xl, height: 56 },
});
