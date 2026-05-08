# Design: Sync Monitor Profile Photo

## State Management

We will use the existing `AuthContext` to manage the profile photo URI globally.

### AuthContext Updates
```typescript
interface AuthContextData {
    // ...
    profilePhotoUri: string | null;
    updateProfilePhoto: (uri: string) => void;
}

// Inside Provider
const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

const updateProfilePhoto = (uri: string) => {
    setProfilePhotoUri(uri);
};
```

## Component Integration

### MonitorProfileScreen
- Use `profilePhotoUri` from `useAuth()`.
- The `onCapture` callback of `ProfilePhotoCaptureModal` will trigger `updateProfilePhoto(uri)`.

### MonitorSidebar
- Use `profilePhotoUri` from `useAuth()`.
- Render an `<Image>` if `profilePhotoUri` is present; otherwise, render the existing `MaterialCommunityIcons`.

## UI/UX
- The transition should be instantaneous across both screens since they share the same context state.
