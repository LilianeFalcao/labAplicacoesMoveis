## Context

The application currently has a basic structure with role-based navigation. We have a set of design images in `docs/` that specify the visual and functional requirements for various screens across Auth, Parent, Monitor, and Admin experiences.

## Goals / Non-Goals

**Goals:**
- Implement all 19+ screens identified in the `docs/` folder.
- Follow the visual identity (colors, layout, icons) shown in the PNG files.
- Ensure all screens are reachable via the appropriate role-based navigation paths.
- Components should be modular and reusable.

**Non-Goals:**
- Implementing the actual backend logic for every piece of data (mock data will be used if API is missing).
- Complex animations not visible in static designs.

## Decisions

- **Styling**: Centralize common styles (colors, spacing) in a `Theme.ts` constants file.
- **Components**: Create a set of base components (`AppButton`, `AppCard`, `AppInput`, `AppHeader`) to maintain consistency.
- **Lists**: Use `FlatList` with optimized rendering for feeds like the "Feed de Fotos" and "Agenda".
- **Images**: Use `expo-image` for better performance and caching of activity photos.
- **Icons**: Standardize on `MaterialCommunityIcons` from `@expo/vector-icons`.

## Risks / Trade-offs

- **Image Complexity**: Some designs might have complex layouts (e.g., charts or intricate grids) that take longer to implement.
- **Dependency Bloat**: Adding libraries for specific UI components (like calendars or camera) should be done carefully.
- **Data Gap**: Many screens require specific data objects (e.g., child history); we'll need to define robust interfaces.
