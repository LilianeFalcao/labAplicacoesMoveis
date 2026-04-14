import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, StyleSheetProperties } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import { ExpoCameraService } from "../../../infrastructure/camera/ExpoCameraService";
import { Theme } from "../../styles/Theme";

interface ProfilePhotoCaptureModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCapture: (uri: string) => void;
}

export const ProfilePhotoCaptureModal: React.FC<ProfilePhotoCaptureModalProps> = ({ isVisible, onClose, onCapture }) => {
    const cameraRef = useRef<CameraView>(null);
    const cameraService = new ExpoCameraService();

    const handleCapture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                if (photo) {
                    onCapture(photo.uri);
                    onClose();
                }
            } catch (error) {
                Alert.alert("Erro", "Não foi possível capturar a foto.");
            }
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide">
            <View style={styles.container}>
                <CameraView style={styles.camera} ref={cameraRef}>
                    <View style={styles.overlay}>
                        <View style={styles.holeContainer}>
                            <View style={styles.maskTop} />
                            <View style={styles.maskMiddle}>
                                <View style={styles.maskSide} />
                                <View style={styles.hole} />
                                <View style={styles.maskSide} />
                            </View>
                            <View style={styles.maskBottom} />
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>

                            <View style={{ width: 40 }} />
                        </View>
                    </View>
                </CameraView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    camera: { flex: 1 },
    overlay: { flex: 1, backgroundColor: "transparent" },
    holeContainer: { flex: 1 },
    maskTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    maskMiddle: { flexDirection: "row", height: 280 },
    maskSide: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    hole: { width: 280, height: 280, borderRadius: 140, borderWidth: 2, borderColor: "#FFF", backgroundColor: "transparent" },
    maskBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    controls: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 40
    },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255, 255, 255, 0.3)", justifyContent: "center", alignItems: "center" },
    captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF" },
    closeButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
});
