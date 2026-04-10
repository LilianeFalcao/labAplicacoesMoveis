import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { useAuth } from '../../contexts/AuthContext';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: {
        icon: any;
        onPress: () => void;
    };
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = false,
    onBack,
    rightAction,
}) => {
    const { isSimulated, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.headerWrapper,
            { paddingTop: Math.max(insets.top, 10) },
            isSimulated && styles.simulatedHeaderWrapper
        ]}>
            {isSimulated && (
                <View style={styles.simulationBanner}>
                    <Text style={styles.simulationText}>MODO DE PRÉ-VISUALIZAÇÃO</Text>
                    <TouchableOpacity onPress={signOut}>
                        <Text style={styles.exitText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.container}>
                <View style={styles.left}>
                    {showBack && (
                        <TouchableOpacity onPress={onBack}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.onPrimary} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.right}>
                    {rightAction && (
                        <TouchableOpacity onPress={rightAction.onPress}>
                            <MaterialCommunityIcons name={rightAction.icon} size={24} color={Theme.colors.onPrimary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: Theme.colors.primary,
    },
    simulatedHeaderWrapper: {
        backgroundColor: Theme.colors.secondaryVariant,
    },
    simulationBanner: {
        backgroundColor: '#FFD700',
        paddingVertical: 2,
        paddingHorizontal: Theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    simulationText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    exitText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        textDecorationLine: 'underline',
    },
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
    },
    left: {
        width: 40,
    },
    right: {
        width: 40,
        alignItems: 'flex-end',
    },
    title: {
        ...Theme.typography.h3,
        color: Theme.colors.onPrimary,
        flex: 1,
        textAlign: 'center',
    },
});
