## 1. Infrastructure & Domain

- [x] 1.1 Create `Incident` entity in `src/domain/activity/entities/Incident.ts` with fields: `id`, `description`, `photo_urls`, `is_emergency`, `class_id`, `student_id` (optional), `created_at`.
- [x] 1.2 Create `IIncidentRepository` interface and `SupabaseIncidentRepository` implementation.
- [x] 1.3 Update `PublishAnnouncementUseCase` to accept an array of `classIds` instead of a single string.

## 2. Components

- [x] 2.1 Create `SpeedDial` component in `src/presentation/components/base/SpeedDial.tsx` using `react-native-paper` or custom animated `TouchableOpacity`.
- [x] 2.2 Create `IncidentReportModal.tsx` for the incident form (Text + Image attachment).
- [x] 2.3 Create `MultiClassNoticeModal.tsx` for the global announcement (Class list + Text + Image).

## 3. UI Integration

- [x] 3.1 Integrate the `SpeedDial` component into `MonitorHomeScreen.tsx`.
- [x] 3.2 Implement "Captura Espontânea" flow: Open camera -> Take Photo -> Open selection modal to link to a class.
- [x] 3.3 Remove the legacy "Solicitar" button from the header of `MonitorHomeScreen` and move it to a fourth option in the Speed Dial (optional, for cleanup).

## 4. Verification

- [ ] 4.1 Verify that a multi-class notice appears correctly for all selected classes.
- [ ] 4.2 Verify that an incident report saves to the database with images and triggers a mock notification.
