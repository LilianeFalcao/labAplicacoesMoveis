import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    style,
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry;
    const finalSecureTextEntry = isPassword && !isPasswordVisible;
    const finalRightIcon = isPassword ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error ? styles.inputError : null,
            ]}>
                {leftIcon && (
                    <MaterialCommunityIcons
                        name={leftIcon}
                        size={20}
                        color={isFocused ? Theme.colors.primary : Theme.colors.gray[400]}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Theme.colors.gray[400]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={finalSecureTextEntry}
                    {...props}
                />
                {finalRightIcon && (
                    <TouchableOpacity
                        onPress={isPassword ? () => setIsPasswordVisible(!isPasswordVisible) : onRightIconPress}
                        disabled={!isPassword && !onRightIconPress}
                        style={styles.rightIcon}
                    >
                        <MaterialCommunityIcons
                            name={finalRightIcon as any}
                            size={20}
                            color={Theme.colors.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.spacing.md,
        width: '100%',
    },
    label: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[700],
        marginBottom: Theme.spacing.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF', // Very light blue background as in designs
        borderWidth: 1,
        borderColor: '#DBEAFE',
        borderRadius: Theme.roundness,
        paddingHorizontal: Theme.spacing.md,
        minHeight: 56,
    },
    inputFocused: {
        borderColor: Theme.colors.primary,
        backgroundColor: Theme.colors.surface,
    },
    input: {
        flex: 1,
        ...Theme.typography.body1,
        color: Theme.colors.onBackground,
        height: '100%',
    },
    leftIcon: {
        marginRight: Theme.spacing.sm,
    },
    rightIcon: {
        marginLeft: Theme.spacing.sm,
    },
    inputError: {
        borderColor: Theme.colors.error,
    },
    errorText: {
        ...Theme.typography.caption,
        color: Theme.colors.error,
        marginTop: Theme.spacing.xs,
    },
});
