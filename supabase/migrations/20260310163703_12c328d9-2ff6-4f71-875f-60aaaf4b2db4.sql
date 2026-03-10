
CREATE OR REPLACE FUNCTION public.handle_join_request(
  p_request_id uuid,
  p_action text,
  p_plan_id uuid,
  p_request_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_id uuid;
  v_is_owner boolean;
BEGIN
  v_caller_id := auth.uid();
  
  -- Verify caller is the plan owner
  SELECT EXISTS (
    SELECT 1 FROM plan_members
    WHERE plan_id = p_plan_id AND user_id = v_caller_id AND role = 'owner'
  ) INTO v_is_owner;
  
  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'Only plan owners can manage join requests';
  END IF;
  
  -- Update the join request status
  UPDATE join_requests SET status = p_action, updated_at = now()
  WHERE id = p_request_id AND plan_id = p_plan_id;
  
  -- If approved, add user as member
  IF p_action = 'approved' THEN
    INSERT INTO plan_members (plan_id, user_id, role)
    VALUES (p_plan_id, p_request_user_id, 'member')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;
