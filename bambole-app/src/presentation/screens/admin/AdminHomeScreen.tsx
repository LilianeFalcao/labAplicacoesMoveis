import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const AdminHomeScreen = ({ navigation }: any) => {
    const { user, signOut } = useAuth();

    const ActionCard = ({ title, icon, onPress, color }: any) => (
        <TouchableOpacity
            style={[styles.card, { borderTopColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.cardIcon}>{icon}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.subtitle}>Bambolê</Text>
                        <Text style={styles.title}>Administração</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    <ActionCard
                        title="Enviar Aviso"
                        icon="📢"
                        color="#6C5CE7"
                        onPress={() => navigation.navigate('CreateAnnouncement')}
                    />
                    <ActionCard
                        title="Gerenciar Turmas"
                        icon="🏫"
                        color="#00B894"
                        onPress={() => { }}
                    />
                    <ActionCard
                        title="Alunos & Pais"
                        icon="👶"
                        color="#FF7675"
                        onPress={() => { }}
                    />
                    <ActionCard
                        title="Equipe Monitores"
                        icon="👥"
                        color="#FDCB6E"
                        onPress={() => { }}
                    />
                    <ActionCard
                        title="Relatórios"
                        icon="📊"
                        color="#0984E3"
                        onPress={() => { }}
                    />
                    <ActionCard
                        title="Configurações"
                        icon="⚙️"
                        color="#636E72"
                        onPress={() => { }}
                    />
                </View>

                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Status do Sistema</Text>
                    <View style={styles.statLine}>
                        <Text style={styles.statLabel}>Total Alunos:</Text>
                        <Text style={styles.statValue}>42</Text>
                    </View>
                    <View style={styles.statLine}>
                        <Text style={styles.statLabel}>Presentes Hoje:</Text>
                        <Text style={styles.statValue}>38</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAFAFA' },
    container: { padding: 20 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 30, marginTop: 10
    },
    subtitle: { fontSize: 14, color: '#636E72', fontWeight: 'bold', textTransform: 'uppercase' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#2D3436' },
    logoutBtn: { backgroundColor: '#FF767522', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    logoutText: { color: '#FF7675', fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        backgroundColor: '#FFF', width: '47%', padding: 20, borderRadius: 15, marginBottom: 20,
        alignItems: 'center', borderTopWidth: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
    },
    cardIcon: { fontSize: 32, marginBottom: 10 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: '#2D3436', textAlign: 'center' },
    statsSection: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3436', marginBottom: 15 },
    statLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statLabel: { color: '#636E72', fontSize: 14 },
    statValue: { color: '#2D3436', fontWeight: 'bold', fontSize: 14 }
});
