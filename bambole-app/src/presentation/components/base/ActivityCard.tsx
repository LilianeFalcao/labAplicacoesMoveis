import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { AppCard } from './AppCard';

interface ActivityCardProps {
    title: string;
    location: string;
    time: string;
    type: string;
    icon?: string;
    style?: StyleProp<ViewStyle>;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    title,
    location,
    time,
    type,
    icon = 'soccer',
    style,
}) => {
    return (
        <AppCard style={[styles.container, style]}>
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
                </View>
                <Text style={styles.time}>{time}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#FFFFFF" opacity={0.8} />
                    <Text style={styles.location}>{location}</Text>
                </View>
            </View>

            <View style={styles.backgroundIcon}>
                <MaterialCommunityIcons name={icon as any} size={120} color="#FFFFFF" opacity={0.1} />
            </View>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.colors.primary,
        padding: Theme.spacing.lg,
        height: 160,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        ...Theme.typography.caption,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 1,
    },
    time: {
        ...Theme.typography.body2,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    content: {
        zIndex: 1,
    },
    title: {
        ...Theme.typography.h2,
        color: '#FFFFFF',
        fontSize: 24,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    location: {
        ...Theme.typography.caption,
        color: '#FFFFFF',
        opacity: 0.9,
        marginLeft: 4,
    },
    backgroundIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
});
