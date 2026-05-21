## 1. Class Name and Linked Guardians Data Fetching

- [x] 1.1 Add React state for `classesMap` (mapping class UUID to name) and `guardiansMap` (mapping child ID to list of linked guardians name and email)
- [x] 1.2 Update the `loadData` method to fetch all classes via `SupabaseClassRepository` and populate `classesMap`
- [x] 1.3 Update the `loadData` method to perform a Supabase join query fetching all `guardian_children` relations joined with user details, populating `guardiansMap`

## 2. Student Card UI Refinement

- [x] 2.1 Update student card rendering to display the corresponding class name from `classesMap` instead of raw UUID `classId`, handling "Sem turma" fallback
- [x] 2.2 Add linked guardians section in student cards to list names and emails of already linked guardians
- [x] 2.3 Add attention badge styled "⚠️ Nenhum responsável vinculado" inside student card when no guardians are linked

## 3. Smart Autocomplete in Guardian Link Modal

- [x] 3.1 Fetch all registered parent users (`role = 'parent'`) inside `loadData` and store in `allParents` state
- [x] 3.2 Add state variables for the autocomplete: search query text, filtered list of parent suggestions, and the currently selected parent profile
- [x] 3.3 Replace the blind email TextInput inside the Linkage Modal with a premium styled search field showing interactive autocomplete suggestions
- [x] 3.4 Connect the selected parent's email to `guardianEmail` state so the existing `LinkChildToGuardianUseCase` execution continues to work perfectly upon click of "Confirmar"

## 4. Verification and Polish

- [x] 4.1 Verify code compiles correctly and tests run successfully
- [x] 4.2 Validate smooth transition animations and UI responsiveness under various states
