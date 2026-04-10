import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const MonitorObservationsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Geral');

    const categories = ['Geral', 'Aviso Urgente', 'Reunião', 'Evento'];

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
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Novo Comunicado"
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: Theme.spacing.xl }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSection}>
                        <MaterialCommunityIcons name="bullhorn-outline" size={48} color={Theme.colors.primary} />
                        <Text style={styles.headerTitle}>O que você quer comunicar?</Text>
                        <Text style={styles.headerSubtitle}>Este aviso será fixado no mural da turma para os pais.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Categoria</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryBadge, category === cat && styles.categoryActive]}
                                    onPress={() => setCategory(cat)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Título do Aviso</Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Ex: Reunião de Pais e Mestres"
                            placeholderTextColor={Theme.colors.gray[400]}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Mensagem Completa</Text>
                        <View style={styles.contentContainer}>
                            <TextInput
                                style={styles.contentInput}
                                placeholder="Descreva os detalhes aqui para os pais..."
                                placeholderTextColor={Theme.colors.gray[400]}
                                multiline
                                textAlignVertical="top"
                                value={content}
                                onChangeText={setContent}
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <MaterialCommunityIcons name="information-outline" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoText}>Os pais receberão uma notificação assim que você publicar este aviso.</Text>
                        </View>

                        <AppButton
                            title="Publicar Aviso Agora"
                            onPress={handleSave}
                            style={styles.button}
                        />

                        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelText}>Descartar Rascunho</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        padding: Theme.spacing.md,
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: Theme.spacing.lg,
    },
    headerTitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
        marginTop: Theme.spacing.md,
        textAlign: 'center',
    },
    headerSubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        textAlign: 'center',
        marginTop: 4,
    },
    form: {
        flex: 1,
    },
    label: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.sm,
        marginTop: Theme.spacing.md,
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.sm,
    },
    categoryBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryActive: {
        backgroundColor: '#F0F9FF',
        borderColor: Theme.colors.primary + '30',
    },
    categoryText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
    },
    categoryTextActive: {
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    titleInput: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        borderRadius: Theme.roundness,
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
    },
    contentContainer: {
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        borderRadius: Theme.roundness,
        backgroundColor: '#FFF',
        minHeight: 180,
    },
    contentInput: {
        padding: Theme.spacing.md,
        flex: 1,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        padding: Theme.spacing.md,
        borderRadius: 12,
        marginTop: Theme.spacing.lg,
        gap: Theme.spacing.sm,
    },
    infoText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
        flex: 1,
    },
    button: {
        marginTop: Theme.spacing.xl,
        height: 56,
    },
    cancelLink: {
        alignItems: 'center',
        marginTop: Theme.spacing.lg,
    },
    cancelText: {
        ...Theme.typography.body2,
        color: Theme.colors.error,
        fontWeight: '600',
    },
});
