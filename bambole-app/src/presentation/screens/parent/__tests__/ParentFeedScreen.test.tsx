import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ParentFeedScreen } from "../ParentFeedScreen";
import { GetActivityFeedUseCase } from "../../../../application/activity/use-cases/GetActivityFeedUseCase";
import { ActivityPhoto } from "../../../../domain/activity/entities/ActivityPhoto";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

// Mock use cases and repository
jest.mock("../../../../application/activity/use-cases/GetActivityFeedUseCase");
jest.mock("../../../../infrastructure/activity/repositories/MockActivityRepository", () => ({
    MockActivityRepository: {
        getInstance: jest.fn().mockReturnValue({
            savePhoto: jest.fn(),
            getFeedByClass: jest.fn(),
        }),
    },
}));

jest.mock("react-native-safe-area-context", () => {
    const { View } = require("react-native");
    return {
        SafeAreaView: (props: any) => <View {...props}>{props.children}</View>,
        SafeAreaProvider: (props: any) => <View {...props}>{props.children}</View>,
        useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
    };
});

describe("ParentFeedScreen", () => {
    const mockPhotos = [
        ActivityPhoto.create({ id: "1", classId: "c1", photoUri: "u1", caption: "Photo 1", timestamp: new Date() }),
        ActivityPhoto.create({ id: "2", classId: "c2", photoUri: "u2", caption: "Photo 2", timestamp: new Date() }),
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (GetActivityFeedUseCase as jest.Mock).prototype.execute = jest.fn().mockResolvedValue(mockPhotos);
    });

    const renderScreen = () => {
        return render(
            <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
                <NavigationContainer>
                    <ParentFeedScreen />
                </NavigationContainer>
            </SafeAreaProvider>
        );
    };

    it("should display activity photos from the feed", async () => {
        const screen = renderScreen();

        await waitFor(() => {
            expect(screen.getByText("Photo 1")).toBeTruthy();
            expect(screen.getByText("Photo 2")).toBeTruthy();
        });
    });

    it("should display a message when the feed is empty", async () => {
        (GetActivityFeedUseCase as jest.Mock).prototype.execute = jest.fn().mockResolvedValue([]);

        const screen = renderScreen();

        await waitFor(() => {
            expect(screen.getByText("Nenhuma foto encontrada para as turmas dos seus filhos.")).toBeTruthy();
        });
    });
});
