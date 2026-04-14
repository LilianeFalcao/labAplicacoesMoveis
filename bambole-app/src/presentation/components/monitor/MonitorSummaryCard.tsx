import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppCard } from '../base/AppCard';

interface MonitorSummaryCardProps {
    label: string;
    value: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    variant: 'blue' | 'green';
}

export const MonitorSummaryCard: React.FC<MonitorSummaryCardProps> = ({ label, value, icon, variant }) => {
    const isBlue = variant === 'blue';
    const bgColor = isBlue ? '#F0F9FF' : '#F0FDF4';
    const iconContainerColor = isBlue ? '#DBEAFE' : '#DCFCE7';
    const iconColor = isBlue ? Theme.colors.primary : '#16A34A';
    const textColor = isBlue ? Theme.colors.primary : '#15803D';

    return (
        <AppCard style={[styles.card, { backgroundColor: '#FFF' }]}>
            <View style={[styles.iconContainer, { backgroundColor: iconContainerColor }]}>
                <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.value, { color: Theme.colors.onBackground }]}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: Theme.spacing.md,
        borderRadius: 20,
        elevation: 0,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    textContainer: {
        gap: 2,
    },
    value: {
        ...Theme.typography.h2,
        fontSize: 28,
        fontWeight: '800',
    },
    label: {
        ...Theme.typography.caption,
        color: Theme.colors.gray[500],
        fontWeight: '600',
    },
});
