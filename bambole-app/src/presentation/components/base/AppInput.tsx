import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Theme } from '../../styles/Theme';

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor={Theme.colors.gray[500]}
                {...props}
            />
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
    },
    input: {
        ...Theme.typography.body1,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.gray[300],
        borderRadius: Theme.roundness,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        color: Theme.colors.onBackground,
        minHeight: 48,
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
