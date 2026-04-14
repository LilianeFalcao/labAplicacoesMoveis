import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard } from '../../components/base/AppCard';
import { ProfilePhotoCaptureModal } from '../../components/shared/ProfilePhotoCaptureModal';

export const MonitorProfileScreen = () => {
    const { user, signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const [isCaptureModalVisible, setCaptureModalVisible] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const menuItems = [
        { id: '1', title: 'Minhas Turmas', icon: 'account-group-outline', color: Theme.colors.primary },
        { id: '2', title: 'Histórico de Atividades', icon: 'history', color: '#10B981' },
        { id: '3', title: 'Configurações', icon: 'cog-outline', color: '#6B7280' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                    <MaterialCommunityIcons name="logout" size={20} color={Theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarCircle}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                            ) : (
                                <MaterialCommunityIcons name="account-tie" size={56} color="#FFF" />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.cameraBadge}
                            onPress={() => setCaptureModalVisible(true)}
                        >
                            <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.email.value.split('@')[0]}</Text>
                    <View style={styles.roleTag}>
                        <Text style={styles.roleText}>Monitor(a)</Text>
                    </View>
                    <Text style={styles.userEmail}>{user?.email.value}</Text>
                </View>

                <View style={styles.menuSection}>
                    {menuItems.map(item => (
                        <TouchableOpacity key={item.id} activeOpacity={0.7} style={styles.menuItemWrapper}>
                            <AppCard style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                                        <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={Theme.colors.gray[300]} />
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutLink} onPress={signOut}>
                    <Text style={styles.logoutText}>Encerrar Sessão</Text>
                </TouchableOpacity>
            </ScrollView>

            <ProfilePhotoCaptureModal
                isVisible={isCaptureModalVisible}
                onClose={() => setCaptureModalVisible(false)}
                onCapture={(uri) => setAvatarUri(uri)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.md },
    headerTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground },
    logoutButton: { padding: 4 },
    container: { flex: 1 },
    scrollContent: { padding: Theme.spacing.lg, alignItems: 'center' },
    profileHeader: { alignItems: 'center', marginBottom: Theme.spacing.xl },
    avatarWrapper: { marginBottom: 16 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#E0F2FE', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.primary, borderWidth: 3, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    userName: { ...Theme.typography.h2, color: Theme.colors.onBackground, textTransform: 'capitalize' },
    roleTag: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
    roleText: { ...Theme.typography.caption, color: Theme.colors.primary, fontWeight: 'bold' },
    userEmail: { ...Theme.typography.body2, color: Theme.colors.gray[500], marginTop: 4 },
    menuSection: { width: '100%', marginTop: Theme.spacing.md },
    menuItemWrapper: { marginBottom: Theme.spacing.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuLabel: { ...Theme.typography.body1, fontWeight: '600', color: Theme.colors.onBackground },
    logoutLink: { marginTop: Theme.spacing.xl, paddingVertical: 12 },
    logoutText: { ...Theme.typography.body2, color: Theme.colors.error, fontWeight: 'bold' },
});
