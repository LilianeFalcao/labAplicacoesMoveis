import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Theme } from '../../styles/Theme';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevated?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, elevated = true }) => {
    return (
        <View style={[styles.card, elevated && styles.elevated, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.roundness,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
