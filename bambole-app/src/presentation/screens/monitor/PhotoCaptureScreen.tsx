import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PhotoCaptureScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [observation, setObservation] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleCapture = () => {
        // Simulação de captura
        setImage('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop');
    };

    const handleSave = () => {
        if (!image) {
            Alert.alert('Erro', 'Capture uma foto primeiro.');
            return;
        }
        Alert.alert('Sucesso', 'O momento foi compartilhado com os pais!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <AppHeader
                title="Capturar Momento"
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.captureSection}>
                        <TouchableOpacity
                            style={[styles.photoCard, !image && styles.photoCardEmpty]}
                            onPress={handleCapture}
                            activeOpacity={0.9}
                        >
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

                    <View style={styles.formSection}>
                        <View style={styles.labelRow}>
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={Theme.colors.primary} />
                            <Text style={styles.label}>O que está acontecendo?</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Descreva brevemente para os pais (ex: Hora da contação de histórias)..."
                                placeholderTextColor={Theme.colors.gray[400]}
                                multiline
                                textAlignVertical="top"
                                value={observation}
                                onChangeText={setObservation}
                            />
                        </View>

                        <View style={styles.visibilityBox}>
                            <MaterialCommunityIcons name="eye-outline" size={18} color={Theme.colors.gray[500]} />
                            <Text style={styles.visibilityText}>Esta foto será visível para todos os pais desta turma.</Text>
                        </View>

                        <AppButton
                            title="Compartilhar com os Pais"
                            onPress={handleSave}
                            disabled={!image}
                            style={styles.button}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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
    scrollContent: {
        padding: Theme.spacing.md,
    },
    captureSection: {
        marginVertical: Theme.spacing.md,
    },
    photoCard: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
    },
    photoCardEmpty: {
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: Theme.colors.primary + '40',
        backgroundColor: '#F0F9FF',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#BAE6FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    placeholderTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        textAlign: 'center',
    },
    placeholderSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        textAlign: 'center',
        marginTop: 4,
    },
    retakeBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    retakeText: {
        ...Theme.typography.caption,
        color: '#FFF',
        fontWeight: 'bold',
    },
    formSection: {
        marginTop: Theme.spacing.lg,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Theme.spacing.sm,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        minHeight: 100,
    },
    input: {
        padding: Theme.spacing.md,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
        flex: 1,
    },
    visibilityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    visibilityText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    button: {
        marginTop: Theme.spacing.xl,
        height: 56,
    },
});
