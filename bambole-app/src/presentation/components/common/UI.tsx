import React from 'react';
import {
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    ActivityIndicator
} from 'react-native';

export const Input = ({ label, ...props }: any) => (
    <View style={styles.inputContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={styles.input}
            placeholderTextColor="#999"
            autoCapitalize="none"
            {...props}
        />
    </View>
);

export const PrimaryButton = ({ title, onPress, loading, disabled }: any) => (
    <TouchableOpacity
        style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
    >
        {loading ? (
            <ActivityIndicator color="#FFF" />
        ) : (
            <Text style={styles.buttonText}>{title}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    inputContainer: { marginBottom: 15, width: '100%' },
    label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '600' },
    input: {
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    button: {
        height: 50,
        backgroundColor: '#E91E63', // Cor Bambolê
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    buttonDisabled: { backgroundColor: '#F48FB1' },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
