import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppCard } from '../../components/base/AppCard';
import { ProfilePhotoCaptureModal } from '../../components/shared/ProfilePhotoCaptureModal';
import { supabase } from '../../../infrastructure/supabase/client';
import { SupabaseUserRepository } from '../../../infrastructure/identity/repositories/SupabaseUserRepository';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from '../../../infrastructure/utils/base64';

export const AdminProfileScreen = () => {
    const { user, signOut, refreshUser } = useAuth();
    const insets = useSafeAreaInsets();
    const [isCaptureModalVisible, setCaptureModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const userRepo = new SupabaseUserRepository();

    const handlePhotoCaptured = async (uri: string) => {
        if (!user) return;
        
        setUploading(true);
        try {
            // 1. Prepare file for upload
            const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            
            // 2. Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // 4. Update User Profile in Database
            const updatedUser = {
                ...user,
                avatarUrl: publicUrl
            };
            
            await userRepo.save(updatedUser as any);
            
            // 5. Refresh local auth state
            await refreshUser();
            
            Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            Alert.alert('Erro', 'Não foi possível salvar a foto: ' + error.message);
        } finally {
            setUploading(false);
            setCaptureModalVisible(false);
        }
    };

    const adminOptions = [
        { id: '1', title: 'Gestão da Escola', icon: 'school-outline', color: Theme.colors.primary },
        { id: '2', title: 'Relatórios Legais', icon: 'file-document-outline', color: '#10B981' },
        { id: '3', title: 'Segurança e Logs', icon: 'shield-check-outline', color: '#F59E0B' },
        { id: '4', title: 'Preferências Gerais', icon: 'tune-vertical', color: '#6B7280' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Configurações de Admin</Text>
                <TouchableOpacity onPress={signOut} style={styles.exitBtn}>
                    <MaterialCommunityIcons name="power" size={24} color={Theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.adminHero}>
                    <View style={styles.imageBox}>
                        <View style={styles.mainAvatar}>
                            {uploading ? (
                                <ActivityIndicator size="large" color="#FFF" />
                            ) : user?.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={styles.img} />
                            ) : (
                                <MaterialCommunityIcons name="shield-account" size={56} color="#FFF" />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.cameraBtn}
                            onPress={() => setCaptureModalVisible(true)}
                            disabled={uploading}
                        >
                            <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.adminName}>{user?.fullName || 'Administrador'}</Text>
                    <Text style={styles.adminEmail}>{user?.email?.value || ''}</Text>
                </View>

                <View style={styles.optionsList}>
                    {adminOptions.map(option => (
                        <TouchableOpacity key={option.id} activeOpacity={0.7} style={styles.optionItemWrapper}>
                            <AppCard style={styles.optionCard}>
                                <View style={styles.optionInner}>
                                    <View style={[styles.iconCircle, { backgroundColor: `${option.color}10` }]}>
                                        <MaterialCommunityIcons name={option.icon as any} size={22} color={option.color} />
                                    </View>
                                    <Text style={styles.optionLabel}>{option.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="arrow-right" size={18} color={Theme.colors.gray[300]} />
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.systemBox}>
                    <Text style={styles.systemTitle}>PLATAFORMA BAMBOLÊ</Text>
                    <Text style={styles.systemVersion}>Build 2026.06.16 • Produção</Text>
                </View>
            </ScrollView>

            <ProfilePhotoCaptureModal
                isVisible={isCaptureModalVisible}
                onClose={() => setCaptureModalVisible(false)}
                onCapture={handlePhotoCaptured}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.md },
    headerTitle: { ...Theme.typography.h3, color: Theme.colors.onBackground },
    exitBtn: { padding: 4 },
    container: { flex: 1 },
    scrollContent: { padding: Theme.spacing.lg },
    adminHero: { alignItems: 'center', marginVertical: Theme.spacing.xl },
    imageBox: { marginBottom: 16 },
    mainAvatar: { width: 100, height: 100, borderRadius: 24, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.gray[100], overflow: 'hidden' },
    img: { width: '100%', height: '100%' },
    cameraBtn: { position: 'absolute', bottom: -8, right: -8, width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.colors.primary, borderWidth: 3, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    adminName: { ...Theme.typography.h2, color: Theme.colors.onBackground },
    adminEmail: { ...Theme.typography.body2, color: Theme.colors.gray[500], marginTop: 2 },
    optionsList: { marginTop: Theme.spacing.lg },
    optionItemWrapper: { marginBottom: Theme.spacing.sm },
    optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md, borderRadius: 16 },
    optionInner: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    optionLabel: { ...Theme.typography.body1, fontWeight: '700', color: Theme.colors.onBackground },
    systemBox: { marginTop: 40, alignItems: 'center', opacity: 0.5 },
    systemTitle: { ...Theme.typography.caption, fontWeight: '900', color: Theme.colors.gray[400], letterSpacing: 2 },
    systemVersion: { ...Theme.typography.caption, color: Theme.colors.gray[400], marginTop: 4 },
});
