import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppButton } from '../base/AppButton';
import { Incident } from '../../../domain/activity/entities/Incident';
import { MockIncidentRepository } from '../../../infrastructure/activity/repositories/MockIncidentRepository';

interface IncidentReportModalProps {
    visible: boolean;
    onClose: () => void;
    monitorId: string;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ visible, onClose, monitorId }) => {
    const [description, setDescription] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);

    const handleAddPhoto = () => {
        // Mock photo addition
        const mockUri = `https://picsum.photos/200/300?random=${Math.random()}`;
        setPhotos([...photos, mockUri]);
    };

    const handleSave = async () => {
        if (!description) {
            Alert.alert('Erro', 'Por favor, descreva o incidente.');
            return;
        }

        try {
            const incident = Incident.create({
                description,
                isEmergency,
                photoUrls: photos,
                classId: 'global', // Multi-turma or global context
                monitorId,
            });

            await MockIncidentRepository.getInstance().save(incident);

            Alert.alert('Sucesso', 'Relatório enviado com sucesso!');
            resetAndClose();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o relatório.');
        }
    };

    const resetAndClose = () => {
        setDescription('');
        setIsEmergency(false);
        setPhotos([]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Relatar Incidente</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[500]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Descrição do ocorrido</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Descreva o que aconteceu em detalhes..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity 
                            style={styles.checkboxRow} 
                            onPress={() => setIsEmergency(!isEmergency)}
                        >
                            <MaterialCommunityIcons 
                                name={isEmergency ? "checkbox-marked" : "checkbox-blank-outline"} 
                                size={24} 
                                color={isEmergency ? Theme.colors.error : Theme.colors.gray[400]} 
                            />
                            <Text style={[styles.checkboxLabel, isEmergency && { color: Theme.colors.error }]}>
                                Este é um caso de emergência crítica
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Evidências / Fotos ({photos.length})</Text>
                        <ScrollView horizontal style={styles.photoList}>
                            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={Theme.colors.primary} />
                            </TouchableOpacity>
                            {photos.map((uri, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image source={{ uri }} style={styles.photo} />
                                    <TouchableOpacity 
                                        style={styles.removePhoto}
                                        onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={20} color={Theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </ScrollView>

                    <View style={styles.footer}>
                        <AppButton 
                            title="Enviar Relatório" 
                            onPress={handleSave} 
                            variant={isEmergency ? 'error' : 'primary'}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        ...Theme.typography.h3,
        color: '#1E293B',
    },
    content: {
        flex: 1,
    },
    label: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.gray[700],
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        backgroundColor: '#F8FAFC',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#FFF1F2',
        padding: 12,
        borderRadius: 12,
    },
    checkboxLabel: {
        marginLeft: 12,
        ...Theme.typography.body2,
        fontWeight: '600',
        color: Theme.colors.gray[600],
    },
    photoList: {
        marginTop: 8,
        flexDirection: 'row',
    },
    addPhotoBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    photoWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removePhoto: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    footer: {
        marginTop: 24,
    },
});
