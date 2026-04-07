import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MonitorManagementScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const monitors = [
        { id: '1', name: 'Ana Silva', email: 'ana.silva@escola.com', groups: ['Berçário A', 'B1'], status: 'Active' },
        { id: '2', name: 'Carlos Oliveira', email: 'carlos.o@escola.com', groups: ['Maternal I'], status: 'Vacation' },
        { id: '3', name: 'Juliana Santos', email: 'ju.santos@escola.com', groups: ['Maternal II', 'A2'], status: 'Active' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return '#059669';
            case 'Vacation': return '#D97706';
            default: return Theme.colors.gray[400];
        }
    };

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <AppHeader
                title="Equipe de Monitores"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'account-plus-outline',
                    onPress: () => { }
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={monitors}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={styles.monitorCount}>{monitors.length} Monitores cadastrados</Text>
                            <TouchableOpacity style={styles.filterBtn}>
                                <MaterialCommunityIcons name="filter-variant" size={20} color={Theme.colors.primary} />
                                <Text style={styles.filterText}>Filtrar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.7}>
                            <AppCard style={styles.monitorCard}>
                                <View style={styles.monitorHeader}>
                                    <View style={styles.profileSection}>
                                        <View style={styles.avatarContainer}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>{item.name[0]}</Text>
                                            </View>
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                        </View>
                                        <View style={styles.details}>
                                            <Text style={styles.name}>{item.name}</Text>
                                            <View style={styles.emailRow}>
                                                <MaterialCommunityIcons name="email-outline" size={12} color={Theme.colors.gray[400]} />
                                                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.optionsBtn}>
                                        <MaterialCommunityIcons name="dots-vertical" size={20} color={Theme.colors.gray[400]} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.groupsSection}>
                                    <Text style={styles.sectionLabel}>Turmas Atribuídas:</Text>
                                    <View style={styles.groupsRow}>
                                        {item.groups.map((group, idx) => (
                                            <View key={idx} style={styles.groupBadge}>
                                                <MaterialCommunityIcons name="door-open" size={10} color={Theme.colors.primary} />
                                                <Text style={styles.groupText}>{group}</Text>
                                            </View>
                                        ))}
                                        <TouchableOpacity style={styles.addGroupBtn}>
                                            <MaterialCommunityIcons name="plus" size={14} color={Theme.colors.gray[400]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </AppCard>
                        </TouchableOpacity>
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
    listContent: {
        padding: Theme.spacing.md,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    monitorCount: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: 'bold',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    filterText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    monitorCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    monitorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Theme.spacing.md,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarText: {
        ...Theme.typography.h3,
        color: Theme.colors.primary,
    },
    details: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    email: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        flex: 1,
    },
    optionsBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.gray[100],
        marginVertical: Theme.spacing.md,
    },
    groupsSection: {
        width: '100%',
    },
    sectionLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginBottom: 6,
        fontWeight: '600',
    },
    groupsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.gray[100],
        gap: 4,
    },
    groupText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[700],
        fontWeight: 'bold',
    },
    addGroupBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Theme.colors.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
});
