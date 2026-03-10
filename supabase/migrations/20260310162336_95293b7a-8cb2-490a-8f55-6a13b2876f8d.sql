
CREATE OR REPLACE FUNCTION public.sync_plan_group_members(p_plan_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id uuid;
  v_plan record;
  v_member_count integer;
BEGIN
  SELECT count(*) INTO v_member_count FROM plan_members WHERE plan_id = p_plan_id;

  IF v_member_count < 2 THEN
    RETURN;
  END IF;

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
$function$;
