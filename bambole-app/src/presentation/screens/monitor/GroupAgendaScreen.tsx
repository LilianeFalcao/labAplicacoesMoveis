import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MonitorStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GroupAgendaRouteProp = RouteProp<MonitorStackParamList, 'GroupAgenda'>;
type GroupAgendaNavigationProp = StackNavigationProp<MonitorStackParamList, 'GroupAgenda'>;

export const GroupAgendaScreen = () => {
    const navigation = useNavigation<GroupAgendaNavigationProp>();
    const route = useRoute<GroupAgendaRouteProp>();
    const insets = useSafeAreaInsets();
    const { groupName = 'Turma A1' } = route.params;

    const agendaItems = [
        { id: '1', time: '08:00', activity: 'Entrada e Acolhimento', completed: true, category: 'Rotina' },
        { id: '2', time: '09:00', activity: 'Roda de Conversa', completed: true, category: 'Pedagógico' },
        { id: '3', time: '10:00', activity: 'Lanche coletivo', completed: false, category: 'Alimentação' },
        { id: '4', time: '10:30', activity: 'Brincadeiras no Pátio', completed: false, category: 'Lazer' },
        { id: '5', time: '12:00', activity: 'Almoço e Higiene', completed: false, category: 'Rotina' },
    ];

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title={groupName}
                showBack
                onBack={() => navigation.goBack()}
            />

            <View style={styles.container}>
                <View style={styles.headerInfo}>
                    <View>
                        <Text style={styles.dateText}>Terça-feira, 31 de Março</Text>
                        <Text style={styles.subtitle}>Cronograma do Dia</Text>
                    </View>
                    <MaterialCommunityIcons name="calendar-month" size={24} color={Theme.colors.primary} />
                </View>

                <FlatList
                    data={agendaItems}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <View style={styles.timelineRow}>
                            <View style={styles.timelineLeft}>
                                <Text style={[styles.timeText, item.completed && styles.completedTime]}>{item.time}</Text>
                                <View style={styles.timelineLineContainer}>
                                    <View style={[styles.dot, item.completed ? styles.dotCompleted : styles.dotPending]} />
                                    {index !== agendaItems.length - 1 && <View style={styles.line} />}
                                </View>
                            </View>

                            <AppCard style={[styles.agendaCard, item.completed && styles.completedCard]}>
                                <View style={styles.cardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.categoryText}>{item.category}</Text>
                                        <Text style={[styles.activityText, item.completed && styles.completedText]}>
                                            {item.activity}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.checkBtn} activeOpacity={0.7}>
                                        <MaterialCommunityIcons
                                            name={item.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                                            size={28}
                                            color={item.completed ? "#10B981" : Theme.colors.gray[200]}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </AppCard>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={[styles.fab, { bottom: insets.bottom + 20 }]}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
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
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    dateText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        fontWeight: '600',
    },
    subtitle: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
    },
    timelineLeft: {
        width: 50,
        alignItems: 'center',
    },
    timeText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: 8,
    },
    completedTime: {
        color: Theme.colors.gray[400],
    },
    timelineLineContainer: {
        flex: 1,
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    dotCompleted: {
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#D1FAE5',
    },
    dotPending: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: Theme.colors.gray[200],
    },
    line: {
        flex: 1,
        width: 2,
        backgroundColor: Theme.colors.gray[100],
        marginVertical: -2,
    },
    agendaCard: {
        flex: 1,
        marginBottom: Theme.spacing.md,
        padding: Theme.spacing.md,
    },
    completedCard: {
        backgroundColor: '#F9FAFB',
        opacity: 0.8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    categoryText: {
        ...Theme.typography.caption,
        color: Theme.colors.primary,
        fontWeight: '700',
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    activityText: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    completedText: {
        color: Theme.colors.gray[400],
        textDecorationLine: 'line-through',
    },
    checkBtn: {
        marginLeft: Theme.spacing.sm,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
