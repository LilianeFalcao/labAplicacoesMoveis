# Design: Monitor Profile Camera Controls

## UI Design

### Layout
- Top row for secondary controls (Flash, Camera Flip).
- Bottom row for main controls (Close, Capture).

### Icons
- **Flash**: 
  - `flash` (Auto)
  - `flash-off` (Off)
  - `flash-on` (On)
- **Camera Flip**:
  - `camera-flip-outline`

## Technical Implementation

### State
```typescript
const [facing, setFacing] = useState<CameraType>('back');
const [flash, setFlash] = useState<FlashMode>('off');
```

### Component Structure
```tsx
<CameraView 
    facing={facing} 
    flash={flash}
    // ...
>
    <View style={styles.topControls}>
        <TouchableOpacity onPress={toggleFlash}>
            <MaterialCommunityIcons name={flashIcon} size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFacing}>
            <MaterialCommunityIcons name="camera-flip" size={28} color="#FFF" />
        </TouchableOpacity>
    </View>
    {/* ... existing hole and bottom controls ... */}
</CameraView>
```

## Considerations
- Ensure permissions are handled (already implemented in the base component but should be verified).
- Circular mask should stay centered regardless of the camera orientation.
