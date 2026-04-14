export interface CameraPermissionResponse {
    granted: boolean;
    canAskAgain: boolean;
}

export interface ICameraService {
    requestPermissions(): Promise<CameraPermissionResponse>;
    takePhoto(): Promise<string | null>;
}
