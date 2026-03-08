
-- Allow plan owners to delete any member from their plan
CREATE POLICY "Plan owners can remove members"
ON public.plan_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM plan_members pm
    WHERE pm.plan_id = plan_members.plan_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
  )
);

-- Create SECURITY DEFINER function to remove user from both plan and group
CREATE OR REPLACE FUNCTION public.remove_plan_member(p_plan_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove from plan_members
  DELETE FROM plan_members WHERE plan_id = p_plan_id AND user_id = p_user_id AND role != 'owner';
  
  -- Remove from the associated group
  DELETE FROM group_members
  WHERE user_id = p_user_id
    AND group_id IN (SELECT id FROM groups WHERE plan_id = p_plan_id);
END;
$$;
