import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'ghost';
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
    const isOutline = variant === 'outline';
    const isText = variant === 'text';
    const isGhost = variant === 'ghost';
    const isSecondary = variant === 'secondary';

    const getTextColor = () => {
        if (disabled) return Theme.colors.gray[500];
        if (isOutline || isText || isGhost) return Theme.colors.primary;
        if (isSecondary) return Theme.colors.onSecondary;
        return Theme.colors.onPrimary;
    };

    const textColor = getTextColor();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isSecondary && styles.secondary,
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

const styles = StyleSheet.create({
    button: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: Theme.spacing.md,
        paddingHorizontal: Theme.spacing.lg,
        borderRadius: Theme.roundness,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        shadowColor: Theme.colors.primary,
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
        backgroundColor: Theme.colors.secondary,
        shadowColor: Theme.colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        shadowOpacity: 0,
        elevation: 0,
    },
    ghost: {
        backgroundColor: 'transparent',
        paddingVertical: Theme.spacing.sm,
        shadowOpacity: 0,
        elevation: 0,
        minHeight: 40,
    },
    disabled: {
        backgroundColor: Theme.colors.gray[200],
        borderColor: Theme.colors.gray[200],
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        ...Theme.typography.button,
    },
    leftIcon: {
        marginRight: Theme.spacing.sm,
    },
    rightIcon: {
        marginLeft: Theme.spacing.sm,
    },
});
