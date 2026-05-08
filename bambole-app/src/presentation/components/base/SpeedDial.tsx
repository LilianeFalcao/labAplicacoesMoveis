import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TouchableWithoutFeedback,
    Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';

const { width, height } = Dimensions.get('window');

export interface SpeedDialAction {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
}

interface SpeedDialProps {
    actions: SpeedDialAction[];
    mainIcon?: string;
    bottomOffset?: number;
}

export const SpeedDial: React.FC<SpeedDialProps> = ({ 
    actions, 
    mainIcon = 'plus',
    bottomOffset = 24 
}) => {
    const [open, setOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = open ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();
        setOpen(!open);
    };

    const rotation = {
        transform: [
            {
                rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                }),
            },
        ],
    };

    const opacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.container}>
            {open && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
            )}

            <View style={[styles.actionsContainer, { bottom: bottomOffset + 70 }]}>
                {actions.map((action, index) => {
                    const translateY = animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -index * 68 - 20],
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.actionWrapper,
                                {
                                    opacity,
                                    transform: [{ translateY }, { scale }],
                                },
                            ]}
                        >
                            <Text style={styles.actionLabel}>{action.label}</Text>
                            <TouchableOpacity
                                style={[styles.actionButton, action.color ? { backgroundColor: action.color } : {}]}
                                onPress={() => {
                                    toggleMenu();
                                    action.onPress();
                                }}
                            >
                                <MaterialCommunityIcons name={action.icon as any} size={24} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.mainButton, { bottom: bottomOffset }]}
                onPress={toggleMenu}
                activeOpacity={0.8}
            >
                <Animated.View style={rotation}>
                    <MaterialCommunityIcons name={mainIcon as any} size={32} color="#FFF" />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: width,
        height: height,
        pointerEvents: 'box-none',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    mainButton: {
        position: 'absolute',
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    actionsContainer: {
        position: 'absolute',
        right: 32,
        bottom: 84, // Starts just above the main FAB center
        alignItems: 'flex-end',
        pointerEvents: 'box-none',
        width: 250,
        height: 300,
    },
    actionWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        pointerEvents: 'auto',
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#475569',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    actionLabel: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
        color: '#1E293B',
        fontWeight: 'bold',
        elevation: 2,
        fontSize: 14,
    },
});
