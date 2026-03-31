import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const StudentMonitorLinkingScreen = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');

    const children = [
        { id: '1', name: 'Joãozinho Silva', group: 'Berçário A', parent: 'Pedro Silva' },
        { id: '2', name: 'Mariazinha Santos', group: 'Maternal I', parent: 'Ana Santos' },
        { id: '3', name: 'Luquinhas Oliveira', group: 'Sem turma', parent: 'Carlos Oliveira' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Vincular Alunos"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchPlaceholder}>Pesquisar aluno...</Text>
                </View>

                <FlatList
                    data={children}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AppCard style={styles.linkCard}>
                            <View style={styles.childInfo}>
                                <View style={styles.details}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.parent}>Responsável: {item.parent}</Text>
                                    <View style={[styles.badge, { backgroundColor: item.group === 'Sem turma' ? Theme.colors.error + '22' : Theme.colors.primary + '22' }]}>
                                        <Text style={[styles.badgeText, { color: item.group === 'Sem turma' ? Theme.colors.error : Theme.colors.primary }]}>
                                            {item.group}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.linkBtn}>
                                <Text style={styles.linkBtnText}>Vincular</Text>
                            </TouchableOpacity>
                        </AppCard>
                    )}
                />
            </View>
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
    searchContainer: {
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        marginHorizontal: Theme.spacing.md,
        marginTop: Theme.spacing.md,
        borderRadius: Theme.roundness,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
    },
    searchPlaceholder: {
        color: Theme.colors.gray[400],
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
    },
    childInfo: {
        flex: 1,
    },
    details: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    parent: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    linkBtn: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        borderRadius: Theme.roundness,
    },
    linkBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
});
