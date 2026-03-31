import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const GroupManagementScreen = () => {
    const navigation = useNavigation();

    const groups = [
        { id: '1', name: 'Berçário A', monitor: 'Ana Silva', students: 12 },
        { id: '2', name: 'Berçário B', monitor: 'Ana Silva', students: 8 },
        { id: '3', name: 'Maternal I', monitor: 'Carlos Oliveira', students: 15 },
        { id: '4', name: 'Maternal II', monitor: 'Juliana Santos', students: 10 },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Turmas"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'plus',
                    onPress: () => { }
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={groups}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AppCard style={styles.groupCard}>
                            <View style={styles.groupInfo}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="school" size={24} color={Theme.colors.primary} />
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.monitor}>Monitor: {item.monitor}</Text>
                                    <Text style={styles.studentCount}>{item.students} Alunos matriculados</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.actionBtn}>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.gray[400]} />
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
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
    },
    groupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Theme.colors.primary + '11',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    details: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    monitor: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginTop: 2,
    },
    studentCount: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    actionBtn: {
        padding: Theme.spacing.xs,
    },
});
