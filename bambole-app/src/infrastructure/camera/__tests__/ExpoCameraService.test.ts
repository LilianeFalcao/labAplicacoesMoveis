import { ICameraService } from "../../../domain/services/ICameraService";
import { ExpoCameraService } from "../ExpoCameraService";
import { Camera } from "expo-camera";

// Mock expo-camera
jest.mock("expo-camera", () => ({
    Camera: {
        requestCameraPermissionsAsync: jest.fn(),
    },
    CameraView: "CameraView",
}));

describe("ExpoCameraService", () => {
    let service: ICameraService;

    beforeEach(() => {
        service = new ExpoCameraService();
        jest.clearAllMocks();
    });

    it("should request permissions and return true if granted", async () => {
        const mockRequest = Camera.requestCameraPermissionsAsync as jest.Mock;
        mockRequest.mockResolvedValue({ status: "granted", canAskAgain: true });

        const result = await service.requestPermissions();
        expect(result.granted).toBe(true);
        expect(mockRequest).toHaveBeenCalled();
    });

    it("should return null if photo capture fails or is cancelled", async () => {
        // This will be implemented in the service
        // For now, it's a placeholder for the TDD flow
        const result = await service.takePhoto();
        expect(result).toBeNull();
    });
});
