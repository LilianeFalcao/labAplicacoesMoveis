import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const MonitorHomeScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();

    const groups = [
        { id: '1', name: 'Turma A1', students: 15, time: '08:00 - 12:00' },
        { id: '2', name: 'Turma B2', students: 12, time: '13:00 - 17:00' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Bambolê - Monitor"
                rightAction={{
                    icon: 'logout',
                    onPress: signOut
                }}
            />
            <View style={styles.container}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcome}>Bom dia,</Text>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0]}</Text>
                </View>

                <Text style={styles.sectionTitle}>Suas Turmas de Hoje</Text>

                <FlatList
                    data={groups}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('GroupAgenda', { groupId: item.id, groupName: item.name })}>
                            <AppCard style={styles.groupCard}>
                                <View style={styles.groupInfo}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name="account-group" size={24} color={Theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.groupName}>{item.name}</Text>
                                        <Text style={styles.groupDetails}>{item.students} Alunos • {item.time}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.gray[400]} />
                            </AppCard>
                        </TouchableOpacity>
                    )}
                />

                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Attendance')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="clipboard-check" size={28} color="#2196F3" />
                            </View>
                            <Text style={styles.actionText}>Chamada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PhotoCapture')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                                <MaterialCommunityIcons name="camera" size={28} color="#9C27B0" />
                            </View>
                            <Text style={styles.actionText}>Foto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Observations')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                                <MaterialCommunityIcons name="note-text" size={28} color="#FF9800" />
                            </View>
                            <Text style={styles.actionText}>Avisos</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        padding: Theme.spacing.md,
    },
    welcomeSection: {
        marginBottom: Theme.spacing.xl,
    },
    welcome: {
        ...Theme.typography.body1,
        color: Theme.colors.gray[600],
    },
    userName: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    sectionTitle: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.md,
    },
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.md,
    },
    groupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    groupName: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    groupDetails: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    quickActions: {
        marginTop: Theme.spacing.xl,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        alignItems: 'center',
        width: '30%',
    },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    actionText: {
        ...Theme.typography.caption,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
});
