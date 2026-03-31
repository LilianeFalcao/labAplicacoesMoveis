import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, ScrollView } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';

export const MonitorObservationsScreen = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (!title || !content) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }
        Alert.alert('Sucesso', 'Aviso enviado para a turma!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Novo Aviso"
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.label}>Título do Aviso</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Ex: Reunião de Pais"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Conteúdo</Text>
                    <TextInput
                        style={styles.contentInput}
                        placeholder="Descreva o aviso aqui..."
                        multiline
                        numberOfLines={6}
                        value={content}
                        onChangeText={setContent}
                    />

                    <AppButton
                        title="Publicar Aviso"
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
    form: {
        flex: 1,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.xs,
        marginTop: Theme.spacing.md,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        ...Theme.typography.body1,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        minHeight: 180,
        textAlignVertical: 'top',
        ...Theme.typography.body2,
    },
    button: {
        marginTop: Theme.spacing.xl,
    },
});
