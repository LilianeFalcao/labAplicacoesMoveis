import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MonitorStackParamList } from '../../navigation/types';

type GroupAgendaRouteProp = RouteProp<MonitorStackParamList, 'GroupAgenda'>;
type GroupAgendaNavigationProp = StackNavigationProp<MonitorStackParamList, 'GroupAgenda'>;

export const GroupAgendaScreen = () => {
    const navigation = useNavigation<GroupAgendaNavigationProp>();
    const route = useRoute<GroupAgendaRouteProp>();
    const { groupName = 'Turma' } = route.params;

    const agendaItems = [
        { id: '1', time: '08:00', activity: 'Entrada e Acolhimento', completed: true },
        { id: '2', time: '09:00', activity: 'Roda de Conversa', completed: true },
        { id: '3', time: '10:00', activity: 'Lanche', completed: false },
        { id: '4', time: '10:30', activity: 'Brincadeiras no Pátio', completed: false },
        { id: '5', time: '12:00', activity: 'Almoço', completed: false },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title={groupName}
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.headerInfo}>
                    <Text style={styles.dateText}>Terça-feira, 31 de Março</Text>
                    <Text style={styles.subtitle}>Cronograma do Dia</Text>
                </View>

                <FlatList
                    data={agendaItems}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <AppCard style={styles.agendaCard}>
                            <View style={styles.agendaRow}>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                    <View style={[styles.statusDot, { backgroundColor: item.completed ? '#4CAF50' : '#FFC107' }]} />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityText, item.completed && styles.completedText]}>{item.activity}</Text>
                                    <Text style={styles.statusText}>{item.completed ? 'Concluído' : 'Próxima atividade'}</Text>
                                </View>
                                <TouchableOpacity>
                                    <MaterialCommunityIcons
                                        name={item.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                        size={28}
                                        color={item.completed ? "#4CAF50" : Theme.colors.gray[300]}
                                    />
                                </TouchableOpacity>
                            </View>
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
        padding: Theme.spacing.md,
    },
    headerInfo: {
        marginBottom: Theme.spacing.lg,
    },
    dateText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
    },
    subtitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    agendaCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
    },
    agendaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeContainer: {
        alignItems: 'center',
        marginRight: Theme.spacing.md,
        paddingRight: Theme.spacing.md,
        borderRightWidth: 1,
        borderRightColor: Theme.colors.gray[200],
    },
    timeText: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 4,
    },
    activityInfo: {
        flex: 1,
    },
    activityText: {
        ...Theme.typography.body1,
        fontWeight: '600',
        color: Theme.colors.onBackground,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: Theme.colors.gray[500],
    },
    statusText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
});
