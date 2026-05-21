## Context

Currently, the `StudentMonitorLinkingScreen.tsx` screen displays a list of students but shows the technical database class UUID (`classId`) instead of the human-readable class name. It also does not list any guardians that are currently linked to the student. Furthermore, linking a guardian is done by typing a raw email address blindly, which is highly error-prone and offers a poor user experience.

This refinement updates `StudentMonitorLinkingScreen.tsx` to fetch classes and existing student-guardian relations, maps UUIDs to names, and implements an autocomplete search dropdown for parents to make the admin panel intuitive and visually premium.

## Goals / Non-Goals

**Goals:**
- Replace class UUIDs with actual friendly class names inside student cards.
- Display a list of linked guardians (name + email) inside each child's card, or a "No guardians linked" warning badge.
- Replace the raw email input in the linkage modal with a dynamic, real-time search field showing matches by name or email, permitting quick tap selection.
- Maintain compatibility with the existing `LinkChildToGuardianUseCase` domain logic and the Supabase database schema.
- Follow premium visual guidelines using Theme colors, clean cards, and visual badges.

**Non-Goals:**
- Modifying the underlying database schema or Supabase policies (RLS).
- Modifying the backend domain entities, repositories, or use cases.
- Adding paging/infinite scroll for parent queries (admins manage small/medium size user sets where in-memory filtering is highly performant and responsive).

## Decisions

### Decision 1: Querying Class and Relationship Data
We will load all classes, student-guardian links, and parent users inside `loadData()` using memory-mapping for instant responsiveness.
- **Option A (Custom Repository & JOIN queries)**: Modify `SupabaseChildRepository` and the `Child` entity to contain classes and guardians.
- **Option B (Memory Mapping in UI)**: Keep the pure domain repository intact. Query classes, `guardian_children` relations, and `users` (parents) directly from the `supabase` client inside the screen's `loadData` method, then map these by ID in the component state (`classesMap`, `guardiansMap`).
- **Rationale**: **Option B** is chosen because it strictly respects the constraint of making changes "estritamente na camada de apresentação (StudentMonitorLinkingScreen.tsx)" without polluting the domain boundaries or breaking Clean Architecture guidelines.

### Decision 2: Smart Autocomplete UX
We will fetch the registered parent users (`role = 'parent'`) once when the screen loads and filter them dynamically in-memory as the admin types.
- **Option A (API-driven search on every keystroke)**: Send a Supabase search query on every character change.
- **Option B (In-memory filtering)**: Fetch the list of parents on screen load/focus once, and use high-performance synchronous string filtering on the local state array.
- **Rationale**: **Option B** provides an instantaneous, fluid typing experience (0ms network latency), reduces database traffic, and is highly robust on slow mobile connections.

## Risks / Trade-offs

### [Data Volume] → Mitigation
- **Risk**: A very large number of parents or classes might cause performance issues during initial load.
- **Mitigation**: Standard centers have a manageable number of classes (< 50) and parents (< 1000). The select query is highly optimized by Postgres index, returning minimal payload (id, full_name, email). In the future, we could add server-side limit and search if needed.

### [Out of Sync Cache] → Mitigation
- **Risk**: A new parent registers after the admin has opened the screen, making them search-invisible.
- **Mitigation**: The list of parents is refreshed automatically every time the screen is refocused or when a successful link operation is completed.
