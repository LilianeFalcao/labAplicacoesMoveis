import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme, ThemeType } from '../../styles/Theme';
import { useAuth } from '../../contexts/AuthContext';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useTheme } from '../../contexts/ThemeContext';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: {
        icon: any;
        onPress: () => void;
    };
    hideSync?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = false,
    onBack,
    rightAction,
    hideSync = false,
}) => {
    const { signOut } = useAuth();
    const isSimulated = false; // Simulated mode flag
    const insets = useSafeAreaInsets();
    const { colors, activeTheme } = useTheme();

    const styles = createStyles(colors, activeTheme);

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
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.right}>
                    {!hideSync && <SyncStatusIndicator />}
                    {rightAction && (
                        <TouchableOpacity onPress={rightAction.onPress} style={{ marginLeft: 8 }}>
                            <MaterialCommunityIcons name={rightAction.icon} size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const createStyles = (colors: ThemeType['colors'], theme: ThemeType) => StyleSheet.create({
    headerWrapper: {
        backgroundColor: colors.primary,
    },
    simulatedHeaderWrapper: {
        backgroundColor: colors.secondaryVariant,
    },
    simulationBanner: {
        backgroundColor: '#FFD700',
        paddingVertical: 2,
        paddingHorizontal: theme.spacing.md,
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
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
    },
    left: {
        width: 40,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    title: {
        ...theme.typography.h3,
        color: colors.onPrimary,
        flex: 1,
        textAlign: 'center',
    },
});
