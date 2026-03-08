
-- Create SECURITY DEFINER function to sync plan members to group
CREATE OR REPLACE FUNCTION public.sync_plan_group_members(p_plan_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_plan record;
BEGIN
  SELECT id INTO v_group_id FROM groups WHERE plan_id = p_plan_id LIMIT 1;

  IF v_group_id IS NULL THEN
    SELECT id, plan_name, destination_name, creator_id INTO v_plan FROM plans WHERE id = p_plan_id;
    IF v_plan IS NULL THEN RETURN; END IF;

    INSERT INTO groups (name, description, category, icon, created_by, plan_id)
    VALUES (v_plan.plan_name, 'Trip group for ' || v_plan.destination_name, 'Plan', 'MapPin', v_plan.creator_id, p_plan_id)
    RETURNING id INTO v_group_id;
  END IF;

  INSERT INTO group_members (group_id, user_id)
  SELECT v_group_id, pm.user_id
  FROM plan_members pm
  WHERE pm.plan_id = p_plan_id
  ON CONFLICT (group_id, user_id) DO NOTHING;
END;
$$;

-- Add RLS policy for plan owners to add members to plan groups
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

-- Enable realtime for group_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
