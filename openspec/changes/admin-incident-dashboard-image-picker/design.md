# Design: Admin Incident Dashboard and Image Picker

## Architecture

The implementation will follow the existing Clean Architecture patterns:
- **Presentation**: New screen `AdminIncidentListScreen` and updated `IncidentReportModal`.
- **Domain**: No changes to entities as they already support the necessary fields.
- **Infrastructure**: Updated `MockIncidentRepository` to implement the read operation.

## UI/UX Design

### Admin Incident List Screen
- **Layout**: `FlatList` with `AppCard` items.
- **Card Content**:
  - Icon: 🚨 for emergencies, 📝 for regular incidents.
  - Title: Incident description (truncated).
  - Subtitle: "Monitor: [Name] | [Date]".
  - Badge: "EMERGÊNCIA" in red if `isEmergency` is true.
- **Navigation**: Tapping a card opens a detailed view (can be a modal or a new screen).

### Incident Report Modal (Image Picker)
- **Flow**:
  1. Click "Add Photo".
  2. Action Sheet / Modal with two options: "Tirar Foto" and "Escolher da Galeria".
  3. Uses `expo-image-picker` to get the URI.
  4. Displays a preview of the selected images.

## Technical Details

### Image Picker Setup
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });
  // handle result
};
```

### Mock Repository Update
```typescript
async getAll(): Promise<Incident[]> {
    return this.incidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
```

## Dependencies
- `expo-image-picker` (to be installed)
