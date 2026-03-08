

## Problem

The Kolkata group shows only 1 member because of an **RLS (Row-Level Security) conflict** on the `group_members` table.

When a plan owner approves join requests, the code tries to add all plan members to the group. However, the `group_members` INSERT policy only allows `auth.uid() = user_id` -- meaning a user can only add **themselves** to a group, not others. So when the owner inserts records for other members, those inserts are **silently rejected** by the database.

This affects both:
- `autoCreateGroup` in usePlans.ts (inserts all plan members when group is first created)
- `handleJoinRequest` in usePlans.ts (inserts newly approved member into existing group)
- `ensurePlanGroups` in useGroups.ts (same pattern)

## Plan

### 1. Create a SECURITY DEFINER database function to sync plan members to groups

Create a function `sync_plan_group_members(p_plan_id uuid)` that:
- Finds or creates the group for the plan
- Inserts all `plan_members` into `group_members` (with ON CONFLICT DO NOTHING)
- Runs as SECURITY DEFINER to bypass RLS

### 2. Add an RLS policy for plan owners to add group members

Add an INSERT policy on `group_members` allowing plan owners to add members to plan-linked groups:
```sql
CREATE POLICY "Plan owners can add members to plan groups"
ON public.group_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    JOIN plan_members pm ON pm.plan_id = g.plan_id
    WHERE g.id = group_members.group_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
  )
);
```

### 3. Update client code to call the sync function

Replace the manual multi-user inserts in `autoCreateGroup`, `handleJoinRequest`, and `ensurePlanGroups` with a call to `supabase.rpc('sync_plan_group_members', { p_plan_id: planId })` -- which handles everything server-side and bypasses RLS.

### 4. Add realtime for group_members table

Enable realtime on `group_members` so the Groups tab updates member counts live.

### Summary of changes
- **1 migration**: New RLS policy + new `sync_plan_group_members` SECURITY DEFINER function + realtime for group_members
- **2 files edited**: `src/hooks/usePlans.ts` and `src/hooks/useGroups.ts` to use the new RPC call instead of direct inserts

