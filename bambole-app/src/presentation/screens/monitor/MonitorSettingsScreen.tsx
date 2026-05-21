import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/base/AppHeader';
import { useTheme, ThemePreference } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const MonitorSettingsScreen = () => {
    const navigation = useNavigation();
    const { themeMode, setThemeMode, colors, isDark } = useTheme();

    const options: { mode: ThemePreference; label: string; icon: any; description: string }[] = [
        {
            mode: 'system',
            label: 'Padrão do Sistema',
            icon: 'cellphone-link',
            description: 'Sincroniza automaticamente a aparência com o tema configurado no seu celular.',
        },
        {
            mode: 'light',
            label: 'Tema Claro',
            icon: 'weather-sunny',
            description: 'Mantém o aplicativo sempre no modo claro para visualização em ambientes iluminados.',
        },
        {
            mode: 'dark',
            label: 'Tema Escuro',
            icon: 'weather-night',
            description: 'Reduz o brilho da tela e o cansaço visual, ideal para uso prolongado ou pouca luz.',
        },
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: 16,
        },
        sectionTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: colors.gray[500],
            textTransform: 'uppercase',
            letterSpacing: 1.1,
            marginBottom: 16,
            marginTop: 8,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1.5,
            borderColor: colors.gray[100],
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.2 : 0.03,
            shadowRadius: 4,
            elevation: 2,
        },
        activeCard: {
            borderColor: colors.primary,
            backgroundColor: isDark ? colors.gray[100] : colors.primary + '08',
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.gray[100],
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        activeIconContainer: {
            backgroundColor: colors.primary + '15',
        },
        textContainer: {
            flex: 1,
        },
        label: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.onBackground,
            marginBottom: 4,
        },
        activeLabel: {
            color: colors.primary,
        },
        description: {
            fontSize: 12,
            color: colors.gray[500],
            lineHeight: 18,
        },
        checkCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: colors.gray[300],
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 12,
        },
        activeCheckCircle: {
            borderColor: colors.primary,
            backgroundColor: colors.primary,
        },
    });

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <AppHeader
                title="Configurações"
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Aparência e Tema</Text>

                {options.map((opt) => {
                    const isActive = themeMode === opt.mode;
                    return (
                        <TouchableOpacity
                            key={opt.mode}
                            style={[styles.card, isActive && styles.activeCard]}
                            activeOpacity={0.8}
                            onPress={() => setThemeMode(opt.mode)}
                        >
                            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                                <MaterialCommunityIcons
                                    name={opt.icon}
                                    size={24}
                                    color={isActive ? colors.primary : colors.gray[500]}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.label, isActive && styles.activeLabel]}>{opt.label}</Text>
                                <Text style={styles.description}>{opt.description}</Text>
                            </View>
                            <View style={[styles.checkCircle, isActive && styles.activeCheckCircle]}>
                                {isActive && (
                                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};
