import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const MonitorManagementScreen = () => {
    const navigation = useNavigation();

    const monitors = [
        { id: '1', name: 'Ana Silva', email: 'ana.silva@escola.com', groups: ['Berçário A', 'B1'] },
        { id: '2', name: 'Carlos Oliveira', email: 'carlos.o@escola.com', groups: ['Maternal I'] },
        { id: '3', name: 'Juliana Santos', email: 'ju.santos@escola.com', groups: ['Maternal II', 'A2'] },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Monitores"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'account-plus',
                    onPress: () => { }
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={monitors}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AppCard style={styles.monitorCard}>
                            <View style={styles.monitorInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.email}>{item.email}</Text>
                                    <View style={styles.groupsRow}>
                                        {item.groups.map((group, idx) => (
                                            <View key={idx} style={styles.groupBadge}>
                                                <Text style={styles.groupText}>{group}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.editBtn}>
                                <MaterialCommunityIcons name="pencil" size={20} color={Theme.colors.primary} />
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
    listContent: {
        padding: Theme.spacing.md,
    },
    monitorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
    },
    monitorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    avatarText: {
        ...Theme.typography.h3,
        color: '#FFF',
    },
    details: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    email: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    groupsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    groupBadge: {
        backgroundColor: Theme.colors.gray[200],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
        marginTop: 4,
    },
    groupText: {
        fontSize: 10,
        color: Theme.colors.gray[700],
        fontWeight: 'bold',
    },
    editBtn: {
        padding: Theme.spacing.xs,
    },
});
