import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/base/AppHeader";
import { Theme } from "../../styles/Theme";
import { ActivityPhoto } from "../../../domain/activity/entities/ActivityPhoto";
import { GetActivityFeedUseCase } from "../../../application/activity/use-cases/GetActivityFeedUseCase";
import { MockActivityRepository } from "../../../infrastructure/activity/repositories/MockActivityRepository";
import { MockEnrollmentService } from "../../../application/activity/services/MockEnrollmentService";

export const ParentFeedScreen = () => {
    const [photos, setPhotos] = useState<ActivityPhoto[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFeed = async () => {
        setRefreshing(true);
        try {
            const enrollmentService = new MockEnrollmentService();
            // In a real app, 'parent-id-123' would come from auth context
            const childrenClassIds = await enrollmentService.getChildrenClassIds("parent-id-123");

            const repository = MockActivityRepository.getInstance();
            const useCase = new GetActivityFeedUseCase(repository);

            const feed = await useCase.execute({ classIds: childrenClassIds });
            setPhotos(feed);
        } catch (error) {
            console.error("Failed to load feed", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadFeed();
    }, []);

    const renderItem = ({ item }: { item: ActivityPhoto }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.photoUri }} style={styles.image} />
            <View style={styles.cardContent}>
                <Text style={styles.caption}>{item.caption || "Sem legenda"}</Text>
                <Text style={styles.timestamp}>{item.timestamp.toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <AppHeader title="Feed de Atividades" />
            <FlatList
                data={photos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma foto encontrada para as turmas dos seus filhos.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    listContent: { padding: Theme.spacing.md },
    card: { backgroundColor: "#FFF", borderRadius: 16, marginBottom: Theme.spacing.lg, overflow: "hidden", elevation: 2 },
    image: { width: "100%", aspectRatio: 4 / 3 },
    cardContent: { padding: Theme.spacing.md },
    caption: { ...Theme.typography.body1, color: Theme.colors.onBackground },
    timestamp: { ...Theme.typography.caption, color: Theme.colors.gray[500], marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
    emptyText: { ...Theme.typography.body2, color: Theme.colors.gray[500], textAlign: "center" },
});
