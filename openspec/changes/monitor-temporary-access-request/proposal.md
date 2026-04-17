# Proposal: Monitor Temporary Access Request

## Goal
Implement a way for monitors to request access to classes that have no assigned monitor.

## Context
When a monitor starts their shift, they might need to assume a class that isn't their usual one or that has no monitor assigned. This feature allows them to request this access temporarily from the administrator.

## Proposed Changes
- New `ClassAccessRequest` entity.
- Repository updates to fetch monitor-less classes.
- UI Modal in Monitor Home.
- TDD with Mocks.
