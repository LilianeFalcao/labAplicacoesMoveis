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
    FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppButton } from '../base/AppButton';
import { MonitorClass } from '../../../application/activity/use-cases/GetMonitorClassesUseCase';

interface MultiClassNoticeModalProps {
    visible: boolean;
    onClose: () => void;
    classes: MonitorClass[];
    onSend: (classIds: string[], content: string) => Promise<void>;
}

export const MultiClassNoticeModal: React.FC<MultiClassNoticeModalProps> = ({ 
    visible, 
    onClose, 
    classes,
    onSend 
}) => {
    const [content, setContent] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleClass = (id: string) => {
        if (selectedClasses.includes(id)) {
            setSelectedClasses(selectedClasses.filter(c => c !== id));
        } else {
            setSelectedClasses([...selectedClasses, id]);
        }
    };

    const handleSend = async () => {
        if (selectedClasses.length === 0) {
            Alert.alert('Erro', 'Selecione pelo menos uma turma.');
            return;
        }
        if (!content) {
            Alert.alert('Erro', 'O conteúdo do aviso não pode estar vazio.');
            return;
        }

        setLoading(true);
        try {
            await onSend(selectedClasses, content);
            Alert.alert('Sucesso', 'Comunicado enviado para os pais!');
            resetAndClose();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao enviar comunicado.');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setContent('');
        setSelectedClasses([]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Comunicado Global</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[500]} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>1. Escolha as turmas destino</Text>
                    <View style={styles.classListContainer}>
                        <FlatList
                            data={classes}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.classChip, 
                                        selectedClasses.includes(item.id) && styles.classChipSelected
                                    ]}
                                    onPress={() => toggleClass(item.id)}
                                >
                                    <Text style={[
                                        styles.classChipText,
                                        selectedClasses.includes(item.id) && styles.classChipTextSelected
                                    ]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <Text style={styles.label}>2. Mensagem do Comunicado</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Escreva aqui o aviso para os pais..."
                        multiline
                        numberOfLines={5}
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />

                    <View style={styles.footer}>
                        <AppButton 
                            title={loading ? "Enviando..." : "Publicar para Todos"} 
                            onPress={handleSend}
                            disabled={loading}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
    label: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.gray[600],
        marginBottom: 10,
        marginTop: 10,
    },
    classListContainer: {
        marginBottom: 15,
    },
    classChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    classChipSelected: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    classChipText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
    },
    classChipTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        backgroundColor: '#F8FAFC',
        ...Theme.typography.body2,
    },
    footer: {
        marginTop: 24,
    },
});
