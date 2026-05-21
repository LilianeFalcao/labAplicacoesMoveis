import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeType } from '../../styles/Theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard } from '../../components/base/AppCard';
import { ProfilePhotoCaptureModal } from '../../components/shared/ProfilePhotoCaptureModal';

export const MonitorProfileScreen = () => {
    const { user, signOut, profilePhotoUri, updateProfilePhoto } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors, activeTheme, isDark } = useTheme();
    const styles = createStyles(colors, activeTheme, isDark);
    const [isCaptureModalVisible, setCaptureModalVisible] = useState(false);

    const menuItems = [
        { 
            id: '3', 
            title: 'Configurações', 
            icon: 'cog-outline', 
            color: '#6B7280',
            onPress: () => navigation.navigate('MonitorSettings')
        },
        {
            id: '4',
            title: 'Segurança e Senha',
            icon: 'shield-lock-outline',
            color: '#F59E0B',
            onPress: () => navigation.navigate('MonitorSecurity') 
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, activeTheme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
                    <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarCircle}>
                            {profilePhotoUri ? (
                                <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
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

                {/* Statistics Section */}
                <View style={styles.statsSection}>
                    <StatsCard 
                        icon="image-multiple" 
                        value="12" 
                        label="Fotos Hoje" 
                        color={colors.primary} 
                        styles={styles}
                    />
                    <StatsCard 
                        icon="clipboard-check" 
                        value="4" 
                        label="Chamadas" 
                        color="#10B981" 
                        styles={styles}
                    />
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionLabel}>Conta e Preferências</Text>
                    {menuItems.map(item => (
                        <TouchableOpacity 
                            key={item.id} 
                            activeOpacity={0.7} 
                            style={styles.menuItemWrapper}
                            onPress={item.onPress}
                        >
                            <AppCard style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                                        <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray[300]} />
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
                onCapture={(uri) => updateProfilePhoto(uri)}
            />
        </SafeAreaView>
    );
};

const StatsCard = ({ icon, value, label, color, styles }: any) => (
    <AppCard style={styles.statsCard}>
        <View style={[styles.statsIconBox, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
    </AppCard>
);

const createStyles = (colors: ThemeType['colors'], theme: ThemeType, isDark: boolean) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
    headerTitle: { ...theme.typography.h3, color: colors.onBackground },
    logoutButton: { padding: 4 },
    container: { flex: 1 },
    scrollContent: { padding: theme.spacing.lg, alignItems: 'center' },
    profileHeader: { alignItems: 'center', marginBottom: theme.spacing.xl },
    avatarWrapper: { marginBottom: 16 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: isDark ? colors.gray[100] : '#E0F2FE', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
    userName: { ...theme.typography.h2, color: colors.onBackground, textTransform: 'capitalize' },
    roleTag: { backgroundColor: isDark ? colors.gray[100] : '#F0F9FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
    roleText: { ...theme.typography.caption, color: colors.primary, fontWeight: 'bold' },
    userEmail: { ...theme.typography.body2, color: colors.gray[500], marginTop: 4 },
    menuSection: { width: '100%', marginTop: theme.spacing.md },
    menuItemWrapper: { marginBottom: theme.spacing.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuLabel: { ...theme.typography.body1, fontWeight: '600', color: colors.onBackground },
    sectionLabel: { ...theme.typography.caption, fontWeight: 'bold', color: colors.gray[400], marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    statsSection: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: theme.spacing.xl },
    statsCard: { flex: 1, alignItems: 'center', padding: 16 },
    statsIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statsValue: { ...theme.typography.h3, color: colors.onBackground },
    statsLabel: { ...theme.typography.caption, color: colors.gray[500] },
    logoutLink: { marginTop: theme.spacing.xl, paddingVertical: 12 },
    logoutText: { ...theme.typography.body2, color: colors.error, fontWeight: 'bold' },
});
