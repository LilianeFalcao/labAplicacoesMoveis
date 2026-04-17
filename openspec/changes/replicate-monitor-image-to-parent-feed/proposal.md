## Why

Parents currently do not have real-time visibility into their children's activities at the recreation center. By replicating the photos captured by monitors directly into the parents' feed, we enhance communication, transparency, and engagement, providing peace of mind and shared experiences for families.

## What Changes

- **New Activity Feed for Parents**: Implementation of a dynamic feed in the parent's app that displays photos of activities their children are participating in.
- **Image Replication Logic**: Automated process to make monitor-captured images available to the relevant parents' feed.
- **TDD Implementation**: Ensure all new logic is backed by tests, starting with mocks as the infrastructure is being developed.
- **LGPD Compliance**: Visibility of photos will respect mandatory image consent and be restricted to parents of children in the same class.

## Capabilities

### New Capabilities
- `parent-activity-feed`: Provides a chronological feed of activity photos for the parent, filtered by their children's classes.

### Modified Capabilities
- `activity-photo`: Update the photo capture process to ensure photos are categorized and flagged for replication to the feed.

## Impact

- **Presentation Layer**: New `ParentFeedScreen` and updates to `PhotoCaptureScreen` to handle post-capture flow.
- **Application Layer**: New use cases for retrieving activity feed items (`GetActivityFeed`).
- **Domain Layer**: Enhancement of `ActivityPhoto` entity and potential new domain events.
- **Infrastructure Layer**: Supabase Storage and Database RLS policies for secure image access.
