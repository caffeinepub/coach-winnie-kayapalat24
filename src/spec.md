# Specification

## Summary
**Goal:** Let members enter and update their own weight, and ensure the updated value is reflected consistently across profile, weekly check-ins, and the member dashboard.

**Planned changes:**
- Update backend weekly check-in submission so a member-submitted `weight` also updates `MemberProfile.currentWeight` for the same `memberId`, while preserving existing ownership/authorization checks.
- Add a member-facing “Update Weight” action on the Member Profile page (only when a member views their own profile) with a numeric “Current weight (kg)” input and Save button that persists to the backend and handles authorization errors with a clear message.
- Ensure member dashboard “Current Weight” displays the latest value immediately after updates (via weekly check-in or profile update), preferring latest weekly check-in weight when available and otherwise using `MemberProfile.currentWeight`.

**User-visible outcome:** Members can update their own current weight (from weekly check-ins or directly on their profile) and see the updated weight immediately on their profile and dashboard without a hard refresh.
