import { Camera } from "expo-camera";
import { ICameraService, CameraPermissionResponse } from "../../domain/services/ICameraService";

export class ExpoCameraService implements ICameraService {
    async requestPermissions(): Promise<CameraPermissionResponse> {
        const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
        return {
            granted: status === "granted",
            canAskAgain,
        };
    }

    async takePhoto(): Promise<string | null> {
        // Note: Actual photo capture happens via CameraView ref in the UI.
        // This service acts as a bridge for permissions and generic camera logic.
        // For now, we return null as the capture logic is tied to the UI component.
        return null;
    }
}
