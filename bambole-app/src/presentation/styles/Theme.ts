export interface ThemeColors {
    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;
    background: string;
    surface: string;
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    error: string;
    onError: string;
    success: string;
    warning: string;
    info: string;
    gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    status: {
        present: {
            bg: string;
            text: string;
        };
        absent: {
            bg: string;
            text: string;
        };
        pending: {
            bg: string;
            text: string;
        };
        alert: {
            bg: string;
            text: string;
        };
    };
}

export interface ThemeType {
    colors: ThemeColors;
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    typography: {
        h1: { fontSize: number; fontWeight: '800' };
        h2: { fontSize: number; fontWeight: '700' };
        h3: { fontSize: number; fontWeight: '600' };
        body1: { fontSize: number; fontWeight: '500'; lineHeight: number };
        body2: { fontSize: number; fontWeight: '400'; lineHeight: number };
        caption: { fontSize: number; fontWeight: '400' };
        button: { fontSize: number; fontWeight: '700' };
    };
    roundness: number;
    borderRadius: {
        sm: number;
        md: number;
        lg: number;
    };
}

const sharedThemeProps = {
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

export const LightTheme: ThemeType = {
    ...sharedThemeProps,
    colors: {
        primary: '#005E9E',
        primaryVariant: '#004A7C',
        secondary: '#69F0AE',
        secondaryVariant: '#4CAF50',
        background: '#F8FAFC',
        surface: '#FFFFFF', // Clean white card surfaces
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
    }
};

export const DarkTheme: ThemeType = {
    ...sharedThemeProps,
    colors: {
        primary: '#38BDF8', // Sleek brighter primary blue for Dark Mode
        primaryVariant: '#0284C7',
        secondary: '#34D399',
        secondaryVariant: '#059669',
        background: '#0F172A', // Slate 900
        surface: '#1E293B', // Slate 800
        onPrimary: '#0F172A',
        onSecondary: '#0F172A',
        onBackground: '#F8FAFC',
        onSurface: '#F1F5F9',
        error: '#F87171',
        onError: '#0F172A',
        success: '#34D399',
        warning: '#FBBF24',
        info: '#60A5FA',
        gray: {
            50: '#0F172A',
            100: '#1E293B',
            200: '#334155',
            300: '#475569',
            400: '#64748B',
            500: '#94A3B8',
            600: '#CBD5E1',
            700: '#E2E8F0',
            800: '#F1F5F9',
            900: '#F8FAFC',
        },
        status: {
            present: {
                bg: '#064E3B',
                text: '#A7F3D0',
            },
            absent: {
                bg: '#7F1D1D',
                text: '#FCA5A5',
            },
            pending: {
                bg: '#0C4A6E',
                text: '#BAE6FD',
            },
            alert: {
                bg: '#78350F',
                text: '#FDE68A',
            }
        }
    }
};

// Keep backwards-compatible default Theme export
export const Theme = LightTheme;
