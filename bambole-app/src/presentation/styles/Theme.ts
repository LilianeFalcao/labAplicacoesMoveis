export const Theme = {
    colors: {
        primary: '#6200EE',
        primaryVariant: '#3700B3',
        secondary: '#03DAC6',
        secondaryVariant: '#018786',
        background: '#F5F5F5',
        surface: '#FFFFFF',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#FFFFFF',
        gray: {
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '700' as const,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600' as const,
        },
        body1: {
            fontSize: 16,
            fontWeight: '400' as const,
        },
        body2: {
            fontSize: 14,
            fontWeight: '400' as const,
        },
        caption: {
            fontSize: 12,
            fontWeight: '400' as const,
        },
        button: {
            fontSize: 14,
            fontWeight: '600' as const,
            textTransform: 'uppercase' as const,
        },
    },
    roundness: 8,
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
    },
};
