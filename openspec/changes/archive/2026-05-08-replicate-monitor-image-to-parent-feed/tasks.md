## 1. Domain Layer

- [x] 1.1 Create `ActivityPhoto` entity in `src/domain/activity/entities/ActivityPhoto.ts`
- [x] 1.2 Create `IActivityRepository` interface in `src/domain/activity/repositories/IActivityRepository.ts`

## 2. Application Layer

- [x] 2.1 Implement `UploadActivityPhotoUseCase` in `src/application/activity/use-cases/UploadActivityPhotoUseCase.ts`
- [x] 2.2 Implement `GetActivityFeedUseCase` in `src/application/activity/use-cases/GetActivityFeedUseCase.ts`
- [x] 2.3 Create unit tests for both use cases in `src/application/activity/__tests__/`

## 3. Infrastructure Layer

- [x] 3.1 Implement `MockActivityRepository` in `src/infrastructure/activity/repositories/MockActivityRepository.ts`

## 4. Presentation Layer (Monitor)

- [x] 4.1 Update `PhotoCaptureScreen` to call `UploadActivityPhotoUseCase` on save
- [x] 4.2 Update `PhotoCaptureScreen.test.tsx` to verify use case call

## 5. Presentation Layer (Parent)

- [x] 5.1 Create `ParentFeedScreen` in `src/presentation/screens/parent/ParentFeedScreen.tsx`
- [x] 5.2 Create `ParentFeedScreen.test.tsx` using TDD

## 6. Verification

- [x] 6.1 Run all unit tests with `npm test`
