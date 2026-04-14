import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { PhotoCaptureScreen } from "../PhotoCaptureScreen";
import { ExpoCameraService } from "../../../../infrastructure/camera/ExpoCameraService";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

// Mock infrastructure
jest.mock("../../../infrastructure/camera/ExpoCameraService");
// Mock expo-camera components
jest.mock("expo-camera", () => ({
    CameraView: (props: any) => <View testID="camera-view">{props.children}</View>,
    Camera: {
        requestCameraPermissionsAsync: jest.fn(),
    },
}));

jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: (props: any) => <View {...props}>{props.children}</View>,
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

describe("PhotoCaptureScreen", () => {
    const mockNavigation = {
        goBack: jest.fn(),
        navigate: jest.fn(),
    };

    const renderScreen = () => {
        return render(
            <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
                <NavigationContainer>
                    <PhotoCaptureScreen />
                </NavigationContainer>
            </SafeAreaProvider>
        );
    };

    it("should request camera permissions when the capture button is pressed", async () => {
        const mockRequest = jest.fn().mockResolvedValue({ granted: true, canAskAgain: true });
        (ExpoCameraService as jest.Mock).prototype.requestPermissions = mockRequest;

        const screen = renderScreen();

        const captureButton = screen.getByText("Toque para fotografar");
        fireEvent.press(captureButton);

        await waitFor(() => {
            expect(mockRequest).toHaveBeenCalled();
        });
    });
});
