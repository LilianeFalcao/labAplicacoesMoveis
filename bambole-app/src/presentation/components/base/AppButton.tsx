import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../../styles/Theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const isOutline = variant === 'outline';
    const isText = variant === 'text';
    const isSecondary = variant === 'secondary';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                isSecondary && styles.secondary,
                isOutline && styles.outline,
                isText && styles.text,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline || isText ? Theme.colors.primary : Theme.colors.onPrimary} />
            ) : (
                <Text
                    style={[
                        styles.buttonText,
                        (isOutline || isText) && styles.outlineText,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
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
        minHeight: 48,
    },
    secondary: {
        backgroundColor: Theme.colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Theme.colors.primary,
    },
    text: {
        backgroundColor: 'transparent',
        paddingVertical: Theme.spacing.sm,
    },
    disabled: {
        backgroundColor: Theme.colors.gray[400],
        borderColor: Theme.colors.gray[400],
    },
    buttonText: {
        ...Theme.typography.button,
        color: Theme.colors.onPrimary,
    },
    outlineText: {
        color: Theme.colors.primary,
    },
});
