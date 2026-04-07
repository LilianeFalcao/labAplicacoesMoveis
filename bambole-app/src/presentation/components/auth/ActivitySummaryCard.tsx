import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppCard } from '../base/AppCard';

export const ActivitySummaryCard = () => {
    return (
        <AppCard style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="soccer" size={24} color={Theme.colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.category}>ATIVIDADE VIVA</Text>
                <Text style={styles.title}>Futebol Juvenil</Text>

                <View style={styles.participants}>
                    <View style={[styles.avatar, { backgroundColor: '#FFD700' }]} />
                    <View style={[styles.avatar, { backgroundColor: '#FF69B4', marginLeft: -8 }]} />
                    <View style={[styles.avatar, { backgroundColor: '#87CEEB', marginLeft: -8 }]} />
                    <View style={styles.moreCount}>
                        <Text style={styles.moreText}>+12</Text>
                    </View>
                </View>
            </View>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.md,
        marginVertical: Theme.spacing.lg,
        width: '90%',
        alignSelf: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EBF5FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.md,
    },
    content: {
        flex: 1,
    },
    category: {
        ...Theme.typography.caption,
        color: '#92400E', // Brown-ish color from design
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        ...Theme.typography.h3,
        color: Theme.colors.onBackground,
        marginTop: 2,
    },
    participants: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Theme.spacing.xs,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Theme.colors.surface,
    },
    moreCount: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#059669',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
        borderWidth: 2,
        borderColor: Theme.colors.surface,
    },
    moreText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
