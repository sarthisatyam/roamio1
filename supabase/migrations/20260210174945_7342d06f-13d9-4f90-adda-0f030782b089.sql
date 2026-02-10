
-- Drop the restrictive INSERT policies and recreate as permissive
DROP POLICY IF EXISTS "Trip owners can add members" ON public.trip_members;
DROP POLICY IF EXISTS "Users can join as themselves" ON public.trip_members;

-- Recreate as PERMISSIVE so either one passing allows the insert
CREATE POLICY "Trip owners can add members"
ON public.trip_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM trip_members tm
    WHERE tm.trip_id = trip_members.trip_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'owner'
  )
);

CREATE POLICY "Users can join as themselves"
ON public.trip_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
