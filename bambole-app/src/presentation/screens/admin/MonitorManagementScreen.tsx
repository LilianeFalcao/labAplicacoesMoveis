import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/base/AppHeader';
import { AppCard } from '../../components/base/AppCard';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../infrastructure/supabase/client';
import { SupabaseClassRepository } from '../../../infrastructure/activity/repositories/SupabaseClassRepository';
import { createClient } from '@supabase/supabase-js';
import { AssignClassesToMonitorUseCase } from '../../../application/activity/use-cases/AssignClassesToMonitorUseCase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const MonitorManagementScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [monitors, setMonitors] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    // Modals
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [linkClassesModalVisible, setLinkClassesModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [actionsModalVisible, setActionsModalVisible] = useState(false);

    // Form inputs
    const [newMonitorName, setNewMonitorName] = useState('');
    const [newMonitorEmail, setNewMonitorEmail] = useState('');
    const [newMonitorPassword, setNewMonitorPassword] = useState('');

    const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
    const [selectedClassesMap, setSelectedClassesMap] = useState<{ [key: string]: boolean }>({});
    const [primaryClassId, setPrimaryClassId] = useState<string | null>(null);
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [saving, setSaving] = useState(false);

    const classRepo = new SupabaseClassRepository();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch classes
            const allClasses = await classRepo.findAll();
            setClasses(allClasses);

            // 2. Fetch monitors
            const { data: monitorsData, error: monitorsError } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'monitor')
                .order('full_name', { ascending: true });

            if (monitorsError) throw monitorsError;

            // 3. Fetch monitor-class activities
            const { data: activities, error: activitiesError } = await supabase
                .from('monitor_activities')
                .select('monitor_id, class_id, is_primary');

            if (activitiesError) throw activitiesError;

            // Map activities to monitors
            const mappedMonitors = (monitorsData || []).map(monitor => {
                const assignedActivities = (activities || [])
                    .filter(act => act.monitor_id === monitor.id);

                const assignedClassIds = assignedActivities.map(act => act.class_id);

                const assignedClasses = allClasses.filter(cls => assignedClassIds.includes(cls.id));

                const primaryActivity = assignedActivities.find(act => act.is_primary);

                return {
                    ...monitor,
                    groups: assignedClasses.map(c => {
                        const act = assignedActivities.find(a => a.class_id === c.id);
                        return act?.is_primary ? `${c.name} ★` : c.name;
                    }),
                    groupIds: assignedClassIds,
                    primaryClassId: primaryActivity?.class_id || null,
                    status: monitor.status || 'Active' // Default to Active
                };
            });

            setMonitors(mappedMonitors);
        } catch (error) {
            console.error('Failed to load monitors', error);
            Alert.alert('Erro', 'Não foi possível carregar os monitores.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleOpenRegister = () => {
        setNewMonitorName('');
        setNewMonitorEmail('');
        setNewMonitorPassword('');
        setRegisterModalVisible(true);
    };

    const handleRegisterMonitor = async () => {
        if (!newMonitorName.trim() || !newMonitorEmail.trim() || !newMonitorPassword.trim()) {
            Alert.alert('Aviso', 'Preencha todos os campos.');
            return;
        }

        if (newMonitorPassword.length < 6) {
            Alert.alert('Erro', 'A senha deve conter no mínimo 6 caracteres.');
            return;
        }

        setSaving(true);
        try {
            // Instantiate secondary client in-memory to prevent admin logout
            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            // 1. Sign up the user in auth schema (which triggers handle_new_user to insert into public.users)
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: newMonitorEmail.trim(),
                password: newMonitorPassword.trim(),
                options: {
                    data: {
                        role: 'monitor',
                        full_name: newMonitorName.trim()
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Não foi possível criar o usuário no sistema.');

            Alert.alert('Sucesso', 'Monitor registrado e perfil criado com sucesso!');
            setRegisterModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to register monitor', error);
            Alert.alert('Erro', error.message || 'Falha ao registrar monitor.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenClassesModal = (monitor: any) => {
        setSelectedMonitor(monitor);
        const map: { [key: string]: boolean } = {};
        classes.forEach(c => {
            map[c.id] = monitor.groupIds.includes(c.id);
        });
        setSelectedClassesMap(map);
        setPrimaryClassId(monitor.primaryClassId || null);
        setActionsModalVisible(false);
        setLinkClassesModalVisible(true);
    };

    const handleSaveClasses = async () => {
        if (!selectedMonitor) return;
        setSaving(true);

        try {
            const assignments = Object.keys(selectedClassesMap)
                .filter(classId => selectedClassesMap[classId])
                .map(classId => ({
                    classId,
                    isPrimary: classId === primaryClassId
                }));

            const assignUseCase = new AssignClassesToMonitorUseCase(classRepo);
            await assignUseCase.execute(selectedMonitor.id, assignments);

            Alert.alert('Sucesso', 'Turmas associadas ao monitor com sucesso!');
            setLinkClassesModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error('Failed to link classes', error);
            Alert.alert('Erro', error.message || 'Não foi possível salvar as atribuições.');
        } finally {
            setSaving(false);
        }
    };

    const toggleClassSelection = (classId: string) => {
        setSelectedClassesMap(prev => {
            const newValue = !prev[classId];
            if (!newValue && primaryClassId === classId) {
                setPrimaryClassId(null);
            }
            return {
                ...prev,
                [classId]: newValue
            };
        });
    };

    const togglePrimaryClass = (classId: string) => {
        if (primaryClassId === classId) {
            setPrimaryClassId(null);
        } else {
            setSelectedClassesMap(prev => ({
                ...prev,
                [classId]: true
            }));
            setPrimaryClassId(classId);
        }
    };

    const handleOpenPasswordReset = (monitor: any) => {
        setSelectedMonitor(monitor);
        setNewPasswordInput('');
        setActionsModalVisible(false);
        setPasswordModalVisible(true);
    };

    const handleResetPassword = async () => {
        if (!selectedMonitor?.email) {
            Alert.alert('Erro', 'E-mail do monitor não encontrado.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                selectedMonitor.email
            );

            if (error) throw error;

            setPasswordModalVisible(false);
            Alert.alert(
                'E-mail Enviado',
                `Um link de redefinição de senha foi enviado para ${selectedMonitor.email}. O monitor deverá acessar o e-mail para definir a nova senha.`,
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Failed to send password reset', error);
            Alert.alert('Erro', error.message || 'Não foi possível enviar o e-mail de redefinição.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenActions = (monitor: any) => {
        setSelectedMonitor(monitor);
        setActionsModalVisible(true);
    };

    const handleDeleteMonitor = (monitor: any) => {
        setActionsModalVisible(false);
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente remover o monitor ${monitor.full_name || monitor.email}? Esta ação excluirá suas atribuições.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Delete from public.users profile (Supabase auth user remains unless using admin API, but profile removal stops them from logging into this app)
                            const { error } = await supabase
                                .from('users')
                                .delete()
                                .eq('id', monitor.id);

                            if (error) throw error;

                            Alert.alert('Sucesso', 'Monitor removido do sistema.');
                            loadData();
                        } catch (err: any) {
                            console.error('Failed to delete monitor', err);
                            Alert.alert('Erro', 'Não foi possível excluir o monitor.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return '#059669';
            case 'Vacation': return '#D97706';
            default: return Theme.colors.gray[400];
        }
    };

    return (
        <SafeAreaView style={styles.mainContainer} edges={['left', 'right', 'bottom']}>
            <AppHeader
                title="Equipe de Monitores"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={{
                    icon: 'account-plus-outline',
                    onPress: handleOpenRegister
                }}
            />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={monitors}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={() => (
                            <View style={styles.listHeader}>
                                <Text style={styles.monitorCount}>{monitors.length} Monitores cadastrados</Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="account-search-outline" size={60} color={Theme.colors.gray[300]} />
                                <Text style={styles.emptyText}>Nenhum monitor cadastrado no banco de dados.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <AppCard style={styles.monitorCard}>
                                <View style={styles.monitorHeader}>
                                    <View style={styles.profileSection}>
                                        <View style={styles.avatarContainer}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>
                                                    {item.full_name ? item.full_name[0].toUpperCase() : item.email[0].toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                        </View>
                                        <View style={styles.details}>
                                            <Text style={styles.name}>{item.full_name || 'Nome Indefinido'}</Text>
                                            <View style={styles.emailRow}>
                                                <MaterialCommunityIcons name="email-outline" size={12} color={Theme.colors.gray[400]} />
                                                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.optionsBtn} onPress={() => handleOpenActions(item)}>
                                        <MaterialCommunityIcons name="dots-vertical" size={24} color={Theme.colors.gray[400]} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.groupsSection}>
                                    <Text style={styles.sectionLabel}>Turmas Atribuídas:</Text>
                                    <View style={styles.groupsRow}>
                                        {item.groups && item.groups.length > 0 ? (
                                            item.groups.map((group: string, idx: number) => (
                                                <View key={idx} style={styles.groupBadge}>
                                                    <MaterialCommunityIcons name="door-open" size={10} color={Theme.colors.primary} />
                                                    <Text style={styles.groupText}>{group}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noGroupsText}>Nenhuma turma atribuída</Text>
                                        )}
                                        <TouchableOpacity
                                            style={styles.addGroupBtn}
                                            onPress={() => handleOpenClassesModal(item)}
                                        >
                                            <MaterialCommunityIcons name="plus" size={14} color={Theme.colors.gray[500]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </AppCard>
                        )}
                    />
                )}
            </View>

            {/* Actions Bottom Sheet Modal */}
            <Modal visible={actionsModalVisible} animationType="slide" transparent>
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheetContent}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                Opções: {selectedMonitor?.full_name || selectedMonitor?.email}
                            </Text>
                            <TouchableOpacity onPress={() => setActionsModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sheetOptions}>
                            <TouchableOpacity
                                style={styles.sheetOptionBtn}
                                onPress={() => handleOpenClassesModal(selectedMonitor)}
                            >
                                <MaterialCommunityIcons name="door-open" size={20} color={Theme.colors.primary} />
                                <Text style={styles.sheetOptionText}>Atribuir Turmas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sheetOptionBtn}
                                onPress={() => handleOpenPasswordReset(selectedMonitor)}
                            >
                                <MaterialCommunityIcons name="lock-reset" size={20} color="#D97706" />
                                <Text style={styles.sheetOptionText}>Redefinir Senha</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sheetOptionBtn, styles.deleteOptionBtn]}
                                onPress={() => handleDeleteMonitor(selectedMonitor)}
                            >
                                <MaterialCommunityIcons name="account-remove-outline" size={20} color={Theme.colors.error} />
                                <Text style={[styles.sheetOptionText, styles.deleteOptionText]}>Remover Monitor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Register Monitor Modal */}
            <Modal visible={registerModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Cadastrar Novo Monitor</Text>
                            <TouchableOpacity onPress={() => setRegisterModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <Text style={styles.inputLabel}>Nome Completo</Text>
                            <TextInput
                                placeholder="Digite o nome completo do monitor..."
                                value={newMonitorName}
                                onChangeText={setNewMonitorName}
                                style={styles.textInput}
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>E-mail Institucional</Text>
                            <TextInput
                                placeholder="exemplo@escola.com"
                                value={newMonitorEmail}
                                onChangeText={setNewMonitorEmail}
                                style={styles.textInput}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor={Theme.colors.gray[400]}
                            />

                            <Text style={styles.inputLabel}>Senha Temporária</Text>
                            <TextInput
                                placeholder="Mínimo de 6 caracteres..."
                                value={newMonitorPassword}
                                onChangeText={setNewMonitorPassword}
                                secureTextEntry
                                style={styles.textInput}
                                autoCapitalize="none"
                                placeholderTextColor={Theme.colors.gray[400]}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setRegisterModalVisible(false)}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleRegisterMonitor}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Cadastrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Associate Classes Modal */}
            <Modal visible={linkClassesModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Atribuir Turmas</Text>
                            <TouchableOpacity onPress={() => setLinkClassesModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Selecione as turmas sob responsabilidade de {selectedMonitor?.full_name}:
                        </Text>

                        <ScrollView style={styles.checklistScroll}>
                            {classes.length === 0 ? (
                                <Text style={styles.noClassesText}>Nenhuma turma cadastrada no sistema.</Text>
                            ) : (
                                classes.map(cls => {
                                    const isSelected = !!selectedClassesMap[cls.id];
                                    const isPrimary = primaryClassId === cls.id;
                                    return (
                                        <View
                                            key={cls.id}
                                            style={[
                                                styles.checkItem,
                                                isSelected && styles.checkItemActive
                                            ]}
                                        >
                                            <TouchableOpacity
                                                style={styles.checkItemLeft}
                                                onPress={() => toggleClassSelection(cls.id)}
                                            >
                                                <MaterialCommunityIcons
                                                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                                                    size={24}
                                                    color={isSelected ? Theme.colors.primary : Theme.colors.gray[400]}
                                                />
                                                <Text style={[
                                                    styles.checkItemText,
                                                    isSelected && styles.checkItemTextActive
                                                ]}>
                                                    {cls.name}
                                                </Text>
                                            </TouchableOpacity>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                {isSelected && (
                                                    <TouchableOpacity
                                                        onPress={() => togglePrimaryClass(cls.id)}
                                                        style={{ padding: 4 }}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name={isPrimary ? "star" : "star-outline"}
                                                            size={24}
                                                            color={isPrimary ? "#EAB308" : Theme.colors.gray[400]}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                                {cls.ageRange && (
                                                    <View style={styles.ageBadge}>
                                                        <Text style={styles.ageBadgeText}>{cls.ageRange}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setLinkClassesModalVisible(false)}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Voltar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveClasses}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Password Reset via Email Modal */}
            <Modal visible={passwordModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Redefinir Senha</Text>
                            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={Theme.colors.gray[700]} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Um link de redefinição será enviado para o e-mail do monitor:
                        </Text>

                        <View style={{
                            backgroundColor: '#F0F9FF',
                            padding: Theme.spacing.md,
                            borderRadius: Theme.borderRadius.md,
                            borderWidth: 1,
                            borderColor: '#E0F2FE',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: Theme.spacing.md,
                        }}>
                            <MaterialCommunityIcons name="email-outline" size={20} color={Theme.colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary }}>
                                {selectedMonitor?.email}
                            </Text>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setPasswordModalVisible(false)}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleResetPassword}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Enviar Link</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    container: {
        flex: 1,
    },
    listContent: {
        padding: Theme.spacing.md,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        paddingHorizontal: 4,
    },
    monitorCount: {
        fontSize: 13,
        color: Theme.colors.gray[500],
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Theme.colors.gray[400],
        textAlign: 'center',
        marginTop: Theme.spacing.md,
        fontSize: 14,
    },
    monitorCard: {
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
        borderRadius: Theme.borderRadius.lg,
    },
    monitorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Theme.spacing.md,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.primary,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.onBackground,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    email: {
        fontSize: 12,
        color: Theme.colors.gray[400],
        flex: 1,
    },
    optionsBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: Theme.spacing.md,
    },
    groupsSection: {
        marginTop: 2,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Theme.colors.gray[500],
        marginBottom: 8,
    },
    groupsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    groupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    groupText: {
        fontSize: 11,
        color: Theme.colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    noGroupsText: {
        fontSize: 12,
        color: Theme.colors.gray[400],
        marginRight: 8,
        fontStyle: 'italic',
    },
    addGroupBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 6,
    },
    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    sheetContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Theme.spacing.lg,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: Theme.spacing.sm,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.onSurface,
        flex: 1,
    },
    sheetOptions: {
        paddingVertical: Theme.spacing.sm,
    },
    sheetOptionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    sheetOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.gray[700],
        marginLeft: Theme.spacing.md,
    },
    deleteOptionBtn: {
        borderBottomWidth: 0,
        marginTop: Theme.spacing.sm,
    },
    deleteOptionText: {
        color: Theme.colors.error,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Theme.spacing.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: Theme.spacing.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.onSurface,
    },
    modalSubtitle: {
        fontSize: 14,
        color: Theme.colors.gray[500],
        marginBottom: Theme.spacing.md,
    },
    formScroll: {
        marginBottom: Theme.spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.gray[700],
        marginBottom: 6,
        marginTop: Theme.spacing.sm,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 48,
        paddingHorizontal: Theme.spacing.sm,
        fontSize: 16,
        color: Theme.colors.onBackground,
        marginBottom: Theme.spacing.sm,
    },
    checklistScroll: {
        maxHeight: 250,
        marginBottom: Theme.spacing.md,
    },
    noClassesText: {
        fontSize: 14,
        color: Theme.colors.gray[400],
        textAlign: 'center',
        paddingVertical: 20,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: Theme.spacing.md,
        backgroundColor: '#F8FAFC',
        borderRadius: Theme.borderRadius.md,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    checkItemActive: {
        borderColor: Theme.colors.primary + '40',
        backgroundColor: '#F0F9FF',
    },
    checkItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: Theme.colors.gray[600],
    },
    checkItemTextActive: {
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    ageBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ageBadgeText: {
        fontSize: 10,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: Theme.spacing.md,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: Theme.borderRadius.md,
        marginRight: Theme.spacing.sm,
    },
    cancelButtonText: {
        color: Theme.colors.gray[700],
        fontWeight: '700',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        marginLeft: Theme.spacing.sm,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
