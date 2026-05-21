import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeType } from '../../styles/Theme';
import { useTheme } from '../../contexts/ThemeContext';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'ghost' | 'error';
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'right',
    style,
    textStyle,
}) => {
    const { colors, activeTheme } = useTheme();
    const isOutline = variant === 'outline';
    const isText = variant === 'text';
    const isGhost = variant === 'ghost';
    const isSecondary = variant === 'secondary';
    const isError = variant === 'error';

    const getTextColor = () => {
        if (disabled) return colors.gray[500];
        if (isOutline || isText || isGhost) return colors.primary;
        if (isSecondary) return colors.onSecondary;
        if (isError) return colors.onError;
        return colors.onPrimary;
    };

    const textColor = getTextColor();
    const styles = createStyles(colors, activeTheme);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isSecondary && styles.secondary,
                isError && styles.error,
                isOutline && styles.outline,
                (isText || isGhost) && styles.ghost,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <MaterialCommunityIcons name={icon} size={20} color={textColor} style={styles.leftIcon} />
                    )}
                    <Text
                        style={[
                            styles.buttonText,
                            { color: textColor },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <MaterialCommunityIcons name={icon} size={20} color={textColor} style={styles.rightIcon} />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const createStyles = (colors: ThemeType['colors'], theme: ThemeType) => StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.roundness,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondary: {
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
    },
    error: {
        backgroundColor: colors.error,
        shadowColor: colors.error,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        shadowOpacity: 0,
        elevation: 0,
    },
    ghost: {
        backgroundColor: 'transparent',
        paddingVertical: theme.spacing.sm,
        shadowOpacity: 0,
        elevation: 0,
        minHeight: 40,
    },
    disabled: {
        backgroundColor: colors.gray[200],
        borderColor: colors.gray[200],
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        ...theme.typography.button,
    },
    leftIcon: {
        marginRight: theme.spacing.sm,
    },
    rightIcon: {
        marginLeft: theme.spacing.sm,
    },
});
