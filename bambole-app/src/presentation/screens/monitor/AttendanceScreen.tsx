import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { PrimaryButton } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseChildRepository } from '@/infrastructure/enrollment/repositories/SupabaseChildRepository';
import { TakeAttendanceUseCase } from '@/application/attendance/use-cases/TakeAttendanceUseCase';
import { SupabaseAttendanceRepository } from '@/infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { SupabaseClassRepository } from '@/infrastructure/activity/repositories/SupabaseClassRepository';

export const AttendanceScreen = ({ route }: any) => {
    const { user } = useAuth();
    const classId = route.params?.classId || 'DEMO_CLASS_01'; // Fallback for demo
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

    const toggleStatus = (id: string) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
        ));
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            // 1. Request location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Acesso negado', 'Precisamos da geolocalização para confirmar a presença.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const geo = { lat: location.coords.latitude, lng: location.coords.longitude };

            // 2. Prepare use case dependencies (Simplified instance creation for demonstration)
            // Ideally inject via Container/Context
            const useCase = new TakeAttendanceUseCase(
                new SupabaseAttendanceRepository(), // I'll need to create this placeholder soon
                new SupabaseClassRepository()        // I'll need to create this placeholder soon
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

            Alert.alert('Sucesso', 'Chamada realizada com sucesso!');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao realizar chamada.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#FF6F61" />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chamada da Turma</Text>
            <FlatList
                data={students}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.studentName}>{item.name.value}</Text>
                        <View style={styles.btnGroup}>
                            <TouchableOpacity
                                style={[styles.statusBtn, item.status === 'present' && styles.presentActive]}
                                onPress={() => toggleStatus(item.id)}
                            >
                                <Text style={item.status === 'present' ? styles.activeText : styles.inactiveText}>Presente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusBtn, item.status === 'absent' && styles.absentActive]}
                                onPress={() => toggleStatus(item.id)}
                            >
                                <Text style={item.status === 'absent' ? styles.activeText : styles.inactiveText}>Faltou</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <PrimaryButton
                    title={submitting ? "Enviando..." : "Finalizar Chamada"}
                    onPress={submitAttendance}
                    disabled={submitting}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2D3436', marginBottom: 20 },
    card: {
        backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    studentName: { fontSize: 16, fontWeight: '600', color: '#2D3436', flex: 1 },
    btnGroup: { flexDirection: 'row' },
    statusBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10, borderWidth: 1, borderColor: '#E0E0E0' },
    presentActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    absentActive: { backgroundColor: '#FF6F61', borderColor: '#FF6F61' },
    activeText: { color: '#FFF', fontWeight: 'bold' },
    inactiveText: { color: '#9E9E9E' },
    footer: { marginTop: 20 }
});
