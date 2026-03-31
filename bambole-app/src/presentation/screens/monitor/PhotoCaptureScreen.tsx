import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { AppHeader } from '@/presentation/components/base/AppHeader';
import { AppButton } from '@/presentation/components/base/AppButton';
import { Theme } from '@/presentation/styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const PhotoCaptureScreen = () => {
    const navigation = useNavigation();
    const [observation, setObservation] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleCapture = () => {
        // Simulação de captura
        setImage('https://via.placeholder.com/400');
    };

    const handleSave = () => {
        if (!image) {
            Alert.alert('Erro', 'Capture uma foto primeiro.');
            return;
        }
        Alert.alert('Sucesso', 'Foto e observação salvas!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Capturar Momento"
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.photoContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.preview} />
                    ) : (
                        <TouchableOpacity style={styles.capturePlaceholder} onPress={handleCapture}>
                            <MaterialCommunityIcons name="camera" size={64} color={Theme.colors.gray[400]} />
                            <Text style={styles.placeholderText}>Toque para capturar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Observação</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descreva o que está acontecendo..."
                        multiline
                        numberOfLines={4}
                        value={observation}
                        onChangeText={setObservation}
                    />

                    <AppButton
                        title="Enviar para os Pais"
                        onPress={handleSave}
                        style={styles.button}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
    },
    photoContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: Theme.colors.gray[200],
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: Theme.spacing.lg,
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    capturePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: Theme.spacing.sm,
    },
    form: {
        flex: 1,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.roundness,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        minHeight: 120,
        textAlignVertical: 'top',
        ...Theme.typography.body2,
    },
    button: {
        marginTop: Theme.spacing.lg,
    },
});
