import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '../../components/base/AppCard';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Theme.spacing.lg * 2 - Theme.spacing.md) / 2;

export const PhotoFeedScreen = () => {
    const insets = useSafeAreaInsets();

    // Mock data for the gallery
    const photoData = [
        { id: '1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=500', date: '31 de Março', activity: 'Futebol' },
        { id: '2', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=500', date: '31 de Março', activity: 'Artes' },
        { id: '3', url: 'https://images.unsplash.com/photo-1540479859204-7cd3b0928f64?q=80&w=500', date: '30 de Março', activity: 'Dança' },
        { id: '4', url: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=500', date: '30 de Março', activity: 'Leitura' },
        { id: '5', url: 'https://images.unsplash.com/photo-1564424224827-cd24b8915874?q=80&w=500', date: '29 de Março', activity: 'Fevereiro' },
        { id: '6', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=500', date: '29 de Março', activity: 'Parque' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, Theme.spacing.md) }]}>
                <Text style={styles.headerTitle}>Fotos da Turma</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.title}>Galeria</Text>
                    <Text style={styles.subtitle}>Veja os melhores momentos das atividades.</Text>
                </View>

                <View style={styles.categoryRow}>
                    <TouchableOpacity style={[styles.categoryChip, styles.activeChip]}>
                        <Text style={[styles.categoryText, styles.activeCategoryText]}>Tudo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Futebol</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Dança</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryChip}>
                        <Text style={styles.categoryText}>Eventos</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.photoGrid}>
                    {photoData.map((item) => (
                        <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.photoItem}>
                            <AppCard style={styles.photoCard}>
                                <Image source={{ uri: item.url }} style={styles.photoImage} />
                                <View style={styles.photoOverlay}>
                                    <Text style={styles.photoDate}>{item.date}</Text>
                                    <Text style={styles.photoActivity}>{item.activity}</Text>
                                </View>
                            </AppCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
    },
    headerTitle: {
        ...Theme.typography.h3,
        fontSize: 18,
        color: Theme.colors.onBackground,
    },
    filterButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    welcomeSection: {
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.lg,
    },
    title: {
        ...Theme.typography.h1,
        fontSize: 28,
        color: Theme.colors.onBackground,
    },
    subtitle: {
        ...Theme.typography.body2,
        color: Theme.colors.gray[600],
        marginTop: 4,
    },
    categoryRow: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.xl,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
    },
    activeChip: {
        backgroundColor: Theme.colors.primary,
    },
    categoryText: {
        ...Theme.typography.caption,
        fontWeight: '700',
        color: Theme.colors.gray[600],
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    photoItem: {
        width: COLUMN_WIDTH,
        marginBottom: Theme.spacing.md,
    },
    photoCard: {
        padding: 0,
        borderRadius: 20,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#E2E8F0',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    photoDate: {
        ...Theme.typography.caption,
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    photoActivity: {
        ...Theme.typography.caption,
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
