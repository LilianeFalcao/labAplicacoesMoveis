import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ThemeType } from '../../styles/Theme';
import { useTheme } from '../../contexts/ThemeContext';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style }) => {
    const { colors, activeTheme, isDark } = useTheme();
    const styles = createStyles(colors, activeTheme, isDark);

    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const createStyles = (colors: ThemeType['colors'], theme: ThemeType, isDark: boolean) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: theme.roundness,
        padding: theme.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 12,
        elevation: 5,
    },
});
