import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, ThemeType } from '../styles/Theme';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
    themeMode: ThemePreference; // 'system' | 'light' | 'dark'
    theme: 'light' | 'dark'; // the resolved theme: 'light' | 'dark'
    colors: ThemeType['colors'];
    activeTheme: ThemeType;
    setThemeMode: (mode: ThemePreference) => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@bambole:theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemePreference>('system');

    useEffect(() => {
        const loadSavedTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedMode) {
                    setThemeModeState(savedMode as ThemePreference);
                }
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        };
        loadSavedTheme();
    }, []);

    const setThemeMode = async (mode: ThemePreference) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    // Resolve 'system' to light/dark based on the OS settings
    const resolvedTheme: 'light' | 'dark' = 
        themeMode === 'system' 
            ? (systemColorScheme === 'dark' ? 'dark' : 'light')
            : themeMode;

    const activeTheme = resolvedTheme === 'dark' ? DarkTheme : LightTheme;
    const isDark = resolvedTheme === 'dark';

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                theme: resolvedTheme,
                colors: activeTheme.colors,
                activeTheme,
                setThemeMode,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
