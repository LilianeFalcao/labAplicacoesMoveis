import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParentStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBadge } from '../../components/base/StatusBadge';

type AttendanceHistoryRouteProp = RouteProp<ParentStackParamList, 'AttendanceHistory'>;
type AttendanceHistoryNavigationProp = StackNavigationProp<ParentStackParamList, 'AttendanceHistory'>;

export const AttendanceHistoryScreen = () => {
    const navigation = useNavigation<AttendanceHistoryNavigationProp>();
    const route = useRoute<AttendanceHistoryRouteProp>();
    const insets = useSafeAreaInsets();
    const { childName = 'Aluno' } = route.params;

    const historyData = [
        { id: '1', date: '31 de Março', dayOfWeek: 'Segunda-feira', status: 'present', label: 'Presente', checkIn: '08:15', checkOut: '17:30' },
        { id: '2', date: '30 de Março', dayOfWeek: 'Domingo', status: 'absent', label: 'Faltou', checkIn: '-', checkOut: '-' },
        { id: '3', date: '29 de Março', dayOfWeek: 'Sábado', status: 'present', label: 'Presente', checkIn: '08:20', checkOut: '17:45' },
        { id: '4', date: '28 de Março', dayOfWeek: 'Sexta-feira', status: 'present', label: 'Presente', checkIn: '08:05', checkOut: '17:20' },
        { id: '5', date: '27 de Março', dayOfWeek: 'Quinta-feira', status: 'present', label: 'Presente', checkIn: '08:10', checkOut: '17:35' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, { paddingTop: insets.top || Theme.spacing.md }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Histórico</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.title}>Presenças de {childName}</Text>
                    <Text style={styles.subtitle}>Março de 2026</Text>
                </View>

                <FlatList
                    data={historyData}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.historyItem}>
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateText}>{item.date.split(' ')[0]}</Text>
                                <Text style={styles.monthText}>{item.date.split(' ')[2]}</Text>
                            </View>
                            <View style={styles.detailsCard}>
                                <View style={styles.cardMain}>
                                    <View>
                                        <Text style={styles.dayText}>{item.dayOfWeek}</Text>
                                        <View style={styles.timesRow}>
                                            <MaterialCommunityIcons name="clock-outline" size={14} color={Theme.colors.gray[500]} />
                                            <Text style={styles.timeText}>{item.checkIn} – {item.checkOut}</Text>
                                        </View>
                                    </View>
                                    <StatusBadge type={item.status as any} label={item.label} />
                                </View>
                            </View>
                        </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    container: {
        flex: 1,
        paddingHorizontal: Theme.spacing.lg,
    },
    summaryInfo: {
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
    },
    title: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
    listContent: {
        paddingBottom: Theme.spacing.xl,
    },
    historyItem: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.md,
        alignItems: 'center',
    },
    dateColumn: {
        width: 60,
        alignItems: 'center',
        marginRight: 12,
    },
    dateText: {
        ...Theme.typography.h2,
        fontSize: 24,
        color: Theme.colors.onBackground,
    },
    monthText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    detailsCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: Theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayText: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    timesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    timeText: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        marginLeft: 4,
    },
});
