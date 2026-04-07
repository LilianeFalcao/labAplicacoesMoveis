import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const StudentMonitorLinkingScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');

    const children = [
        { id: '1', name: 'Joãozinho Silva', group: 'Berçário A', parent: 'Pedro Silva', status: 'Linked' },
        { id: '2', name: 'Mariazinha Santos', group: 'Maternal I', parent: 'Ana Santos', status: 'Linked' },
        { id: '3', name: 'Luquinhas Oliveira', group: 'Sem turma', parent: 'Carlos Oliveira', status: 'Pending' },
    ];

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <AppHeader
                title="Vínculos Escoleres"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color={Theme.colors.gray[400]} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar aluno ou responsável..."
                            placeholderTextColor={Theme.colors.gray[400]}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <MaterialCommunityIcons name="close-circle" size={16} color={Theme.colors.gray[300]} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <FlatList
                    data={children}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Alunos e Responsáveis</Text>
                            <Text style={styles.listSubtitle}>Gerencie os vínculos entre alunos, turmas e pais.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <AppCard style={styles.linkCard}>
                            <View style={styles.cardMain}>
                                <View style={styles.avatarCircle}>
                                    <MaterialCommunityIcons name="account-child" size={24} color={Theme.colors.primary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.childName}>{item.name}</Text>
                                    <View style={styles.parentRow}>
                                        <MaterialCommunityIcons name="account-tie-outline" size={12} color={Theme.colors.gray[400]} />
                                        <Text style={styles.parentName}>{item.parent}</Text>
                                    </View>

                                    <View style={styles.metaRow}>
                                        <View style={[
                                            styles.groupBadge,
                                            item.group === 'Sem turma' ? styles.groupBadgePending : styles.groupBadgeActive
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={item.group === 'Sem turma' ? 'alert-circle-outline' : 'door-open'}
                                                size={10}
                                                color={item.group === 'Sem turma' ? Theme.colors.error : Theme.colors.primary}
                                            />
                                            <Text style={[
                                                styles.groupText,
                                                item.group === 'Sem turma' ? styles.groupTextPending : styles.groupTextActive
                                            ]}>
                                                {item.group}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialCommunityIcons name="link-plus" size={18} color={Theme.colors.primary} />
                                    <Text style={styles.actionBtnText}>Vincular</Text>
                                </TouchableOpacity>
                                <View style={styles.vDivider} />
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialCommunityIcons name="eye-outline" size={18} color={Theme.colors.gray[400]} />
                                </TouchableOpacity>
                            </View>
                        </AppCard>
                    )}
                />
            </View>
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
    searchSection: {
        padding: Theme.spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: Theme.spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        gap: 8,
    },
    searchInput: {
        flex: 1,
        ...Theme.typography.body2,
        color: Theme.colors.onBackground,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    listHeader: {
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    listTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    listSubtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    linkCard: {
        padding: 0,
        marginBottom: Theme.spacing.md,
        overflow: 'hidden',
    },
    cardMain: {
        flexDirection: 'row',
        padding: Theme.spacing.md,
        alignItems: 'center',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    childName: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    parentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    parentName: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    groupBadgeActive: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    groupBadgePending: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: Theme.colors.error + '20',
    },
    groupText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    groupTextActive: {
        color: Theme.colors.primary,
    },
    groupTextPending: {
        color: Theme.colors.error,
    },
    actionsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
        backgroundColor: '#F8FAFC',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    actionBtnText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    vDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Theme.colors.gray[200],
        alignSelf: 'center',
    },
});
