
-- Restrict groups visibility to authenticated users
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
CREATE POLICY "Authenticated users can view groups"
ON public.groups
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Restrict group members visibility to authenticated users
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
CREATE POLICY "Authenticated users can view group members"
ON public.group_members
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow users to delete their own companion connections (sent or received)
CREATE POLICY "Users can delete their connections"
ON public.companion_connections
FOR DELETE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
