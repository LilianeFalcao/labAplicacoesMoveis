import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../styles/Theme';

export type StatusType = 'present' | 'absent' | 'pending' | 'alert';

interface StatusBadgeProps {
    type: StatusType;
    label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, label }) => {
    const colors = Theme.colors.status[type];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {type === 'present' && <View style={styles.dot} />}
            {type === 'pending' && <View style={[styles.dot, { backgroundColor: colors.text }]} />}
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#15803D',
        marginRight: 6,
    },
    label: {
        ...Theme.typography.caption,
        fontSize: 10,
        fontWeight: '700',
    },
});
