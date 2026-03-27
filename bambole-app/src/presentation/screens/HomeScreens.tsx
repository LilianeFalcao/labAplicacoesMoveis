import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const HomeBase = ({ role }: { role: string }) => {
    const { signOut } = useAuth();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Área do {role}</Text>
            <Button title="Sair" onPress={signOut} />
        </View>
    );
};

export const ParentHome = () => <HomeBase role="Pai" />;
export const MonitorHome = () => <HomeBase role="Monitor" />;
export const AdminHome = () => <HomeBase role="Admin" />;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, marginBottom: 20 },
});
