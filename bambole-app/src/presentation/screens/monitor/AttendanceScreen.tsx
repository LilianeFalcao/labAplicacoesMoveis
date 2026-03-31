import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
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

type AttendanceRouteProp = RouteProp<MonitorStackParamList, 'Attendance'>;
type AttendanceNavigationProp = StackNavigationProp<MonitorStackParamList, 'Attendance'>;

export const AttendanceScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<AttendanceNavigationProp>();
    const route = useRoute<AttendanceRouteProp>();
    const classId = route.params?.classId || 'DEMO_CLASS_01';
    const groupName = route.params?.groupName || 'Turma';
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
            Alert.alert('Erro', 'Não foi possível carregar os alunos.');
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
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Chamada"
                showBack
                onBack={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <View style={styles.headerInfo}>
                    <Text style={styles.groupName}>{groupName}</Text>
                    <Text style={styles.studentCount}>{students.length} Alunos</Text>
                </View>

                <FlatList
                    data={students}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <AppCard style={styles.studentCard}>
                            <View style={styles.studentInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{item.name.value[0]}</Text>
                                </View>
                                <Text style={styles.name} numberOfLines={1}>{item.name.value}</Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={() => toggleStatus(item.id, 'present')}
                                    style={[styles.statusBtn, item.status === 'present' && styles.presentActive]}
                                >
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={20}
                                        color={item.status === 'present' ? '#FFF' : Theme.colors.gray[400]}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => toggleStatus(item.id, 'absent')}
                                    style={[styles.statusBtn, item.status === 'absent' && styles.absentActive]}
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={20}
                                        color={item.status === 'absent' ? '#FFF' : Theme.colors.gray[400]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </AppCard>
                    )}
                />

                <View style={styles.footer}>
                    <AppButton
                        title="Finalizar Chamada"
                        onPress={submitAttendance}
                        loading={submitting}
                    />
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
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    headerInfo: {
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.gray[100],
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.gray[200],
    },
    groupName: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
    },
    studentCount: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.sm,
        marginBottom: Theme.spacing.sm,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.sm,
    },
    avatarText: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: '#FFF',
    },
    name: {
        ...Theme.typography.body1,
        fontWeight: '600',
        color: Theme.colors.onBackground,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
    },
    statusBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Theme.colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Theme.spacing.xs,
    },
    presentActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    absentActive: {
        backgroundColor: Theme.colors.error,
        borderColor: Theme.colors.error,
    },
    footer: {
        padding: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.gray[200],
    },
});
