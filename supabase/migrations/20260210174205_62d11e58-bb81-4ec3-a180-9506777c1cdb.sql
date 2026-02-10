
-- Allow trip owners to add members (when accepting join requests)
CREATE POLICY "Trip owners can add members"
ON public.trip_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM trip_members tm
    WHERE tm.trip_id = trip_members.trip_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'owner'
  )
);
