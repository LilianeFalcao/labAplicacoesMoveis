import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import { Theme } from '../../styles/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParentStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityCard } from '../../components/base/ActivityCard';
import { AppCard } from '../../components/base/AppCard';
import { AppButton } from '../../components/base/AppButton';

type ChildDetailsRouteProp = RouteProp<ParentStackParamList, 'ChildDetails'>;
type ChildDetailsNavigationProp = StackNavigationProp<ParentStackParamList, 'ChildDetails'>;

export const ChildDetailsScreen = () => {
    const navigation = useNavigation<ChildDetailsNavigationProp>();
    const route = useRoute<ChildDetailsRouteProp>();
    const insets = useSafeAreaInsets();
    const { childName = 'Lucas Ferreira', class_id = 'Futebol — 6 a 9 anos' } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, { paddingTop: insets.top || Theme.spacing.md }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bambolê</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell" size={24} color={Theme.colors.onBackground} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="account" size={60} color={Theme.colors.onPrimary} />
                        </View>
                        <View style={styles.statusBadgeDot}>
                            <MaterialCommunityIcons name="emoticon-happy" size={14} color="#FFFFFF" />
                        </View>
                    </View>
                    <Text style={styles.name}>{childName}</Text>
                    <View style={styles.classInfo}>
                        <MaterialCommunityIcons name="soccer" size={16} color={Theme.colors.primary} />
                        <Text style={styles.classText}>Turma {class_id}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.presenceCard}>
                        <View style={styles.presenceIcon}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.presenceContent}>
                            <Text style={styles.presenceLabel}>PRESENÇA HOJE</Text>
                            <Text style={styles.presenceStatus}>Presente — <Text style={styles.presenceTime}>registrado às 14:15</Text></Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <ActivityCard
                        type="ESPORTE"
                        time="14h – 15h30"
                        title="Treino de Futebol"
                        location="Quadra Poliesportiva Central"
                        icon="soccer"
                    />
                </View>

                <AppCard style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryTitle}>Resumo do Mês</Text>
                            <Text style={styles.summarySubtitle}>Setembro 2023</Text>
                        </View>
                        <View style={styles.frequencyContainer}>
                            <Text style={styles.frequencyValue}>86%</Text>
                            <Text style={styles.frequencyLabel}>FREQUÊNCIA</Text>
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: '86%' }]} />
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statText}>PRESENÇAS</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: '#EF4444' }]}>02</Text>
                            <Text style={styles.statText}>FALTAS</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: Theme.colors.primary }]}>01</Text>
                            <Text style={styles.statText}>JUSTIF.</Text>
                        </View>
                    </View>
                </AppCard>

                <AppButton
                    variant="primary"
                    title="Ver Histórico de Presenças"
                    icon="calendar-month"
                    onPress={() => navigation.navigate('AttendanceHistory', { childName })}
                    style={styles.historyButton}
                />
            </ScrollView>
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
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.xl,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        marginBottom: 16,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#DBEAFE',
    },
    statusBadgeDot: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#059669',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        ...Theme.typography.h1,
        fontSize: 32,
        color: Theme.colors.onBackground,
        textAlign: 'center',
    },
    classInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    classText: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginLeft: 6,
    },
    section: {
        marginBottom: Theme.spacing.lg,
    },
    presenceCard: {
        flexDirection: 'row',
        backgroundColor: '#DCFCE7',
        padding: Theme.spacing.lg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        alignItems: 'center',
    },
    presenceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    presenceContent: {
        flex: 1,
    },
    presenceLabel: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: '#15803D',
        letterSpacing: 1,
    },
    presenceStatus: {
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
        fontWeight: '700',
        marginTop: 2,
    },
    presenceTime: {
        fontWeight: '400',
        color: Theme.colors.gray[600],
    },
    summaryCard: {
        padding: Theme.spacing.lg,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        marginBottom: Theme.spacing.xl,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    summaryTitle: {
        ...Theme.typography.h3,
        fontSize: 20,
        color: Theme.colors.onBackground,
    },
    summarySubtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[500],
        marginTop: 2,
    },
    frequencyContainer: {
        alignItems: 'flex-end',
    },
    frequencyValue: {
        ...Theme.typography.h1,
        fontSize: 32,
        color: Theme.colors.primary,
    },
    frequencyLabel: {
        ...Theme.typography.caption,
        fontWeight: '800',
        color: Theme.colors.primary,
        letterSpacing: 1,
    },
    progressBarContainer: {
        marginBottom: 24,
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 6,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        width: '30%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    statNumber: {
        ...Theme.typography.h2,
        fontSize: 24,
        color: '#059669',
    },
    statText: {
        ...Theme.typography.caption,
        fontSize: 9,
        fontWeight: '800',
        color: Theme.colors.gray[500],
        marginTop: 4,
    },
    historyButton: {
        height: 60,
        borderRadius: 30,
    },
});
