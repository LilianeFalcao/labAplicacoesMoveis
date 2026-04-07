export const Theme = {
    colors: {
        primary: '#005E9E', // Derived from designs (Bambolê Blue)
        primaryVariant: '#004A7C',
        secondary: '#69F0AE', // Derived from designs (Green Badge)
        secondaryVariant: '#4CAF50',
        background: '#F8FAFC', // Very light blue/white
        surface: '#F8FAFC',
        onPrimary: '#FFFFFF',
        onSecondary: '#003300',
        onBackground: '#1E293B', // Slate 800
        onSurface: '#0F172A',
        error: '#EF4444',
        onError: '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        gray: {
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
            present: {
                bg: '#DCFCE7',
                text: '#15803D',
            },
            absent: {
                bg: '#FEE2E2',
                text: '#B91C1C',
            },
            pending: {
                bg: '#E0F2FE',
                text: '#0369A1',
            },
            alert: {
                bg: '#FEF3C7',
                text: '#B45309',
            }
        }
    },
    spacing: {
        xs: 9,
        sm: 8,
        md: 16,
        lg: 25,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800' as const,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as const,
        },
        body1: {
            fontSize: 16,
            fontWeight: '500' as const,
            lineHeight: 24,
        },
        body2: {
            fontSize: 14,
            fontWeight: '400' as const,
            lineHeight: 20,
        },
        caption: {
            fontSize: 12,
            fontWeight: '400' as const,
        },
        button: {
            fontSize: 16,
            fontWeight: '700' as const,
        },
    },
    roundness: 16,
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
    },
};
