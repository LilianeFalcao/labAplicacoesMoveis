import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { AppButton } from '../../components/base/AppButton';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MonitorStackParamList } from '../../navigation/types';
import { SupabaseChildRepository } from '@/infrastructure/enrollment/repositories/SupabaseChildRepository';
import { TakeAttendanceUseCase } from '@/application/attendance/use-cases/TakeAttendanceUseCase';
import { SupabaseAttendanceRepository } from '@/infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { SupabaseClassRepository } from '@/infrastructure/activity/repositories/SupabaseClassRepository';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AttendanceRouteProp = RouteProp<MonitorStackParamList, 'Attendance'>;
type AttendanceNavigationProp = StackNavigationProp<MonitorStackParamList, 'Attendance'>;

export const AttendanceScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<AttendanceNavigationProp>();
    const route = useRoute<AttendanceRouteProp>();
    const insets = useSafeAreaInsets();

    const classId = route.params?.classId || 'DEMO_CLASS_01';
    const groupName = route.params?.groupName || 'Turma A1';

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStudents();
    }, [classId]);

    const loadStudents = async () => {
        try {
            const repo = new SupabaseChildRepository();
            const list = await repo.findByClass(classId);
            setStudents(list.map(s => ({ ...s, status: 'present' })));
        } catch (err) {
            // Fallback for demo/dev
            setStudents([
                { id: '1', name: { value: 'Alice Silva' }, status: 'present' },
                { id: '2', name: { value: 'Bruno Costa' }, status: 'present' },
                { id: '3', name: { value: 'Carla Dias' }, status: 'present' },
                { id: '4', name: { value: 'Daniel Souza' }, status: 'absent' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id: string, status: 'present' | 'absent') => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, status } : s
        ));
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Acesso negado', 'Precisamos da geolocalização para confirmar a presença.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const geo = { lat: location.coords.latitude, lng: location.coords.longitude };

            const useCase = new TakeAttendanceUseCase(
                new SupabaseAttendanceRepository(),
                new SupabaseClassRepository()
            );

            await useCase.execute(
                classId,
                user!.id,
                new Date(),
                students.map(s => ({
                    childId: s.id,
                    status: s.status,
                    geolocation: s.status === 'present' ? geo : undefined
                }))
            );

            Alert.alert('Sucesso', 'Chamada realizada com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao realizar chamada.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Chamada da Turma"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View>
                <View style={styles.headerInfo}>
                    <View>
                        <Text style={styles.groupName}>{groupName}</Text>
                        <Text style={styles.subtext}>Selecione a presença de cada aluno</Text>
                    </View>
                </View>

                <FlatList
                    data={students}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <AppCard style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                                <View style={[styles.avatar, { backgroundColor: item.status === 'present' ? Theme.colors.status.present.bg : Theme.colors.gray[100] }]}>
                                    <Text style={[styles.avatarText, { color: item.status === 'present' ? Theme.colors.status.present.text : Theme.colors.gray[400] }]}>
                                        {item.name.value[0]}
                                    </Text>
                                </View>
                                <View style={styles.nameContainer}>
                                    <Text style={styles.name} numberOfLines={1}>{item.name.value}</Text>
                                    <Text style={styles.statusLabel}>
                                        {item.status === 'present' ? 'Presente' : 'Ausente'}
                                    </Text>
                                </View>

                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        onPress={() => toggleStatus(item.id, 'present')}
                                        style={[styles.toggleBtn, item.status === 'present' && styles.presentActive]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color={item.status === 'present' ? '#FFF' : Theme.colors.gray[300]}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => toggleStatus(item.id, 'absent')}
                                        style={[styles.toggleBtn, item.status === 'absent' && styles.absentActive]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={20}
                                            color={item.status === 'absent' ? '#FFF' : Theme.colors.gray[300]}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </AppCard>
                    )}
                />
            </View>
            <View style={styles.footer}>
                <View style={styles.progressSection}>
                    <Text style={styles.progressText}>
                        {students.filter(s => s.status === 'present').length} de {students.length} marcados
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${(students.filter(s => s.status === 'present').length / students.length) * 100}%` }
                            ]}
                        />
                    </View>
                </View>
                <AppButton
                    title="Confirmar Chamada"
                    onPress={submitAttendance}
                    loading={submitting}
                    style={styles.submitBtn}
                    icon="arrow-right"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.lg,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[100],
    },
    groupName: {
        ...Theme.typography.h2,
        color: Theme.colors.onBackground,
    },
    subtext: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    statsBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Theme.colors.primary + '20',
    },
    statsText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    studentCard: {
        marginBottom: Theme.spacing.sm,
        padding: Theme.spacing.md,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    avatarText: {
        ...Theme.typography.body1,
        fontWeight: 'bold',
    },
    nameContainer: {
        flex: 1,
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    statusLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        marginTop: 2,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: Theme.spacing.sm,
    },
    toggleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    presentActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    absentActive: {
        backgroundColor: Theme.colors.error,
        borderColor: Theme.colors.error,
    },
    footer: {
        padding: Theme.spacing.md,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[100],
    },
    progressSection: {
        marginBottom: Theme.spacing.md,
    },
    progressText: {
        ...Theme.typography.caption,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: Theme.colors.gray[100],
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 3,
    },
    submitBtn: {
        height: 56,
    },
});
