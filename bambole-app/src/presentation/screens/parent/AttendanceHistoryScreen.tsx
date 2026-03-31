import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParentStackParamList } from '../../navigation/types';

type AttendanceHistoryRouteProp = RouteProp<ParentStackParamList, 'AttendanceHistory'>;
type AttendanceHistoryNavigationProp = StackNavigationProp<ParentStackParamList, 'AttendanceHistory'>;

export const AttendanceHistoryScreen = () => {
    const navigation = useNavigation<AttendanceHistoryNavigationProp>();
    const route = useRoute<AttendanceHistoryRouteProp>();
    const { childName = 'Aluno' } = route.params;

    const historyData = [
        { id: '1', date: '31/03/2026', status: 'Presente', checkIn: '08:15', checkOut: '17:30' },
        { id: '2', date: '30/03/2026', status: 'Presente', checkIn: '08:20', checkOut: '17:45' },
        { id: '3', date: '27/03/2026', status: 'Faltou', checkIn: '-', checkOut: '-' },
        { id: '4', date: '26/03/2026', status: 'Presente', checkIn: '08:05', checkOut: '17:20' },
        { id: '5', date: '25/03/2026', status: 'Presente', checkIn: '08:10', checkOut: '17:35' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Histórico"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <Text style={styles.title}>Presenças de {childName}</Text>

                <FlatList
                    data={historyData}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AppCard style={styles.itemCard}>
                            <View style={styles.dateInfo}>
                                <Text style={styles.dateText}>{item.date}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Presente' ? '#E8F5E9' : '#FFEBEE' }]}>
                                    <Text style={[styles.statusText, { color: item.status === 'Presente' ? '#2E7D32' : '#C62828' }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>

                            {item.status === 'Presente' && (
                                <View style={styles.timesRow}>
                                    <View style={styles.timeInfo}>
                                        <MaterialCommunityIcons name="clock-in" size={16} color={Theme.colors.gray[500]} />
                                        <Text style={styles.timeText}>{item.checkIn}</Text>
                                    </View>
                                    <View style={styles.timeInfo}>
                                        <MaterialCommunityIcons name="clock-out" size={16} color={Theme.colors.gray[500]} />
                                        <Text style={styles.timeText}>{item.checkOut}</Text>
                                    </View>
                                </View>
                            )}
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
    title: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.lg,
    },
    listContent: {
        paddingBottom: Theme.spacing.lg,
    },
    itemCard: {
        padding: Theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flex: 1,
    },
    dateText: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    statusText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
    },
    timesRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Theme.spacing.md,
    },
    timeText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[700],
        marginLeft: 4,
    },
});
