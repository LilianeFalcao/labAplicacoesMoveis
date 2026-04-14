import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppCard } from '../base/AppCard';

export interface TurmaAgendaItem {
    id: string;
    name: string;
    category: string;
    status: 'pending' | 'completed' | 'upcoming';
    statusLabel: string;
    ageGroup?: string;
    students?: number;
    timeLabel: string;
    location?: string;
    finishedAt?: string;
    avatars?: string[];
}

interface TurmaAgendaCardProps {
    item: TurmaAgendaItem;
    onAction?: () => void;
    onPress?: () => void;
}

export const TurmaDetailItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.detailItem}>
        <View style={styles.detailIconBox}>
            <MaterialCommunityIcons name={icon} size={18} color={Theme.colors.primary} />
        </View>
        <View>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

export const TurmaAgendaCard: React.FC<TurmaAgendaCardProps> = ({ item, onAction, onPress }) => {
    const isPending = item.status === 'pending';
    const isCompleted = item.status === 'completed';
    const isUpcoming = item.status === 'upcoming';

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <AppCard style={[styles.card, isCompleted && styles.completedCard]}>
                <View style={styles.header}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        isPending && styles.statusBadgePending,
                        isCompleted && styles.statusBadgeCompleted,
                        isUpcoming && styles.statusBadgeUpcoming
                    ]}>
                        <MaterialCommunityIcons
                            name={isPending ? 'alert-circle' : isCompleted ? 'check-circle' : 'clock-outline'}
                            size={14}
                            color={isPending ? Theme.colors.error : isCompleted ? '#10B981' : Theme.colors.primary}
                        />
                        <Text style={[
                            styles.statusText,
                            isPending && styles.statusTextPending,
                            isCompleted && styles.statusTextCompleted,
                            isUpcoming && styles.statusTextUpcoming
                        ]}>
                            {item.statusLabel}
                        </Text>
                    </View>
                </View>

                <Text style={styles.name}>{item.name}</Text>

                {isPending && (
                    <View style={styles.detailsGrid}>
                        <View style={styles.row}>
                            <TurmaDetailItem icon="face-man-profile" label="FAIXA ETÁRIA" value={item.ageGroup || 'N/A'} />
                            <TurmaDetailItem icon="clock-outline" label="HORÁRIO" value={item.timeLabel} />
                        </View>
                        <View style={styles.row}>
                            <TurmaDetailItem icon="account-group-outline" label="ALUNOS" value={`${item.students} Inscritos`} />
                            <TurmaDetailItem icon="map-marker-outline" label="LOCAL" value={item.location || 'N/A'} />
                        </View>

                        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                            <Text style={styles.actionButtonText}>Realizar Chamada</Text>
                            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                )}

                {isCompleted && (
                    <View style={styles.completedFooter}>
                        <View style={styles.completedMeta}>
                            <MaterialCommunityIcons name="history" size={16} color={Theme.colors.gray[400]} />
                            <Text style={styles.completedTime}>Finalizada às {item.finishedAt}</Text>
                        </View>
                        <TouchableOpacity onPress={onPress}>
                            <Text style={styles.detailsLink}>Ver detalhes</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isUpcoming && (
                    <View style={styles.upcomingFooter}>
                        <View style={styles.avatarRow}>
                            {item.avatars?.slice(0, 3).map((_, i) => (
                                <View key={i} style={[styles.avatarCircle, { marginLeft: i > 0 ? -10 : 0 }]}>
                                    <View style={styles.avatarPlaceholder}>
                                        <MaterialCommunityIcons name="account" size={16} color={Theme.colors.gray[300]} />
                                    </View>
                                </View>
                            ))}
                            {item.students && item.students > 3 && (
                                <View style={[styles.avatarCircle, styles.moreCircle, { marginLeft: -10 }]}>
                                    <Text style={styles.moreText}>+{item.students - 3}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.vDivider} />
                        <Text style={styles.upcomingTime}>{item.timeLabel}</Text>
                    </View>
                )}
            </AppCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: Theme.spacing.lg,
        borderRadius: 32,
        marginBottom: Theme.spacing.md,
        backgroundColor: '#FFF',
        elevation: 0,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    completedCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.primary,
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadgePending: { backgroundColor: '#FEF2F2' },
    statusBadgeCompleted: { backgroundColor: '#DCFCE7' },
    statusBadgeUpcoming: { backgroundColor: '#E0F2FE' },
    statusText: { fontSize: 11, fontWeight: '700' },
    statusTextPending: { color: Theme.colors.error },
    statusTextCompleted: { color: '#16A34A' },
    statusTextUpcoming: { color: Theme.colors.primary },
    name: {
        ...Theme.typography.h2,
        fontSize: 28,
        color: Theme.colors.onBackground,
        marginBottom: 20,
    },
    detailsGrid: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    detailIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailLabel: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[400],
        fontSize: 9,
        fontWeight: '700',
    },
    detailValue: {
        ...Theme.typography.body2,
        fontWeight: 'bold',
        color: Theme.colors.onBackground,
    },
    actionButton: {
        backgroundColor: '#0F172A',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
    },
    completedFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    completedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    completedTime: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
    },
    detailsLink: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[600],
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    upcomingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#FFF',
        overflow: 'hidden',
    },
    avatarPlaceholder: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreCircle: {
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    vDivider: {
        width: 1,
        height: 20,
        backgroundColor: Theme.colors.gray[200],
        marginHorizontal: 16,
    },
    upcomingTime: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        fontWeight: '600',
    },
});
