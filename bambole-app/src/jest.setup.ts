import 'react-native-gesture-handler/jestSetup';

// Mocking AsyncStorage globally for Jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mocking Supabase globally to prevent connection/env errors in Jest
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        auth: {
            signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
            onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
    }),
}));

// Mocking expo-sqlite globally to prevent native module errors in Jest
jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn().mockResolvedValue({
        execAsync: jest.fn().mockResolvedValue(undefined),
        getAllAsync: jest.fn().mockResolvedValue([]),
        runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    }),
}));

// Mocking ThemeContext globally for all presentation component & screen tests
jest.mock('./presentation/contexts/ThemeContext', () => ({
    useTheme: () => ({
        themeMode: 'light',
        theme: 'light',
        colors: {
            primary: '#005E9E',
            primaryVariant: '#004A7C',
            secondary: '#69F0AE',
            secondaryVariant: '#4CAF50',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            onPrimary: '#FFFFFF',
            onSecondary: '#003300',
            onBackground: '#1E293B',
            onSurface: '#0F172A',
            error: '#EF4444',
            onError: '#FFFFFF',
            success: '#10B981',
            warning: '#F59E0B',
            info: '#3B82F6',
            gray: {
                50: '#F8FAFC',
                100: '#F1F5F9',
                200: '#E2E8F0',
                300: '#CBD5E1',
                400: '#94A3B8',
                500: '#64748B',
                600: '#475569',
                700: '#334155',
                800: '#1E293B',
                900: '#0F172A',
            },
            status: {
                present: { bg: '#DCFCE7', text: '#15803D' },
                absent: { bg: '#FEE2E2', text: '#B91C1C' },
                pending: { bg: '#E0F2FE', text: '#0369A1' },
                alert: { bg: '#FEF3C7', text: '#B45309' },
            }
        },
        activeTheme: {
            spacing: { xs: 9, sm: 8, md: 16, lg: 25, xl: 32, xxl: 48 },
            typography: {
                h1: { fontSize: 32, fontWeight: '800' },
                h2: { fontSize: 24, fontWeight: '700' },
                h3: { fontSize: 20, fontWeight: '600' },
                body1: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
                body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
                caption: { fontSize: 12, fontWeight: '400' },
                button: { fontSize: 16, fontWeight: '700' },
            },
            roundness: 16,
            borderRadius: { sm: 4, md: 8, lg: 12 },
        },
        setThemeMode: jest.fn().mockResolvedValue(undefined),
        isDark: false,
    }),
}));

