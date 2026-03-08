

## Current State

The Journey page's **Group mode** has a `GroupMembersManager` that only adds members by typing a name string -- it's completely local, not connected to real users or the database. There's no way to search for, invite, or request to join other Roamio users from within the Journey page.

Meanwhile, the **Companion page** has a full trip-based system (`useTrips`, `trip_members`, `trip_requests`) with real DB integration, join requests, and group chat.

## Plan

### 1. Upgrade GroupMembersManager to search real users
- Replace the "type a name" input with a **user search** that queries the `profiles` table by `display_name` or `city`
- Show search results with avatar, name, city, and verified badge
- "Invite" button sends a connection request or adds them to the journey group

### 2. Add "Invite Roamio User" flow
- When clicking "Add" in group mode, open a dialog with two options:
  - **Search Users**: search `profiles` table, show matching users, send invite
  - **Share Invite Link**: (future) generate a shareable link
- Use the existing `companion_connections` table to send connection/invite requests, or create a new `journey_invites` table for journey-specific invitations

### 3. Create a `journey_invites` database table
- Columns: `id`, `journey_trip_id` (nullable, for linking to a trip), `from_user_id`, `to_user_id`, `status` (pending/accepted/declined), `created_at`
- RLS: users can insert where `from_user_id = auth.uid()`, view where they're sender or receiver, update where they're receiver

### 4. Show pending invites & accept/decline
- Add an "Invites" badge/section on the Journey page header showing pending invites count
- Tapping shows a list of incoming invites with Accept/Decline buttons
- Accepted users get added to `groupMembers` with their real profile data (user_id, display_name, avatar_url)

### 5. Update GroupMember interface
- Extend `GroupMember` to include `user_id`, `avatar_url`, `is_online` (from `user_presence`)
- Display real avatars and online status in the member list

### Technical Details

**New migration:**
```sql
CREATE TABLE journey_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE journey_invites ENABLE ROW LEVEL SECURITY;
-- RLS policies for insert, select, update
```

**Files to modify:**
- `src/components/journey/GroupMembersManager.tsx` -- replace name input with user search + invite
- `src/components/pages/JourneyPage.tsx` -- add invite notifications, fetch real group members
- New hook: `src/hooks/useJourneyInvites.ts` -- manage invite CRUD and real-time subscriptions

