import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { SyncQueueRepository } from '../../../infrastructure/sync/SyncQueueRepository';
import { SyncManager } from '../../../infrastructure/sync/SyncManager';

export const SyncStatusIndicator = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const spinValue = new Animated.Value(0);
    const queue = SyncQueueRepository.getInstance();
    const syncManager = SyncManager.getInstance();

    useEffect(() => {
        const updateStatus = async () => {
            const count = await queue.countPending();
            setPendingCount(count);
        };

        const interval = setInterval(updateStatus, 3000);
        updateStatus();

        return () => clearInterval(interval);
    }, []);

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        
        // Start spinning
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();

        try {
            await syncManager.sync();
        } finally {
            setIsSyncing(false);
            spinValue.setValue(0);
        }
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getIconDetails = () => {
        if (isSyncing) return { name: 'sync', color: Theme.colors.primary };
        if (pendingCount > 0) return { name: 'cloud-upload', color: '#F59E0B' }; // Orange
        return { name: 'cloud-check', color: '#10B981' }; // Green
    };

    const details = getIconDetails();

    return (
        <TouchableOpacity onPress={handleSync} style={styles.container} activeOpacity={0.7}>
            <Animated.View style={isSyncing ? { transform: [{ rotate: spin }] } : {}}>
                <MaterialCommunityIcons name={details.name as any} size={24} color={details.color} />
            </Animated.View>
            {pendingCount > 0 && !isSyncing && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: Theme.colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
