CREATE OR REPLACE FUNCTION public.auto_create_host_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_name text;
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    v_name := COALESCE(NULLIF(NEW.business_name, ''), NEW.legal_name);

    SELECT id INTO v_group_id FROM public.groups
      WHERE created_by = NEW.user_id AND category = 'Host Community' AND name = v_name
      LIMIT 1;

    IF v_group_id IS NULL THEN
      INSERT INTO public.groups (name, description, category, icon, created_by)
      VALUES (
        v_name,
        COALESCE(NEW.bio, 'Official community for ' || v_name),
        'Host Community',
        'Sparkles',
        NEW.user_id
      )
      RETURNING id INTO v_group_id;

      INSERT INTO public.group_members (group_id, user_id)
      VALUES (v_group_id, NEW.user_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_host_community_ins ON public.host_profiles;
CREATE TRIGGER trg_auto_create_host_community_ins
AFTER INSERT ON public.host_profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_create_host_community();

DROP TRIGGER IF EXISTS trg_auto_create_host_community_upd ON public.host_profiles;
CREATE TRIGGER trg_auto_create_host_community_upd
AFTER UPDATE ON public.host_profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_create_host_community();

-- Backfill, skipping hosts whose user_id is missing from auth.users
INSERT INTO public.groups (name, description, category, icon, created_by)
SELECT
  COALESCE(NULLIF(hp.business_name, ''), hp.legal_name),
  COALESCE(hp.bio, 'Official community for ' || COALESCE(NULLIF(hp.business_name, ''), hp.legal_name)),
  'Host Community',
  'Sparkles',
  hp.user_id
FROM public.host_profiles hp
JOIN auth.users u ON u.id = hp.user_id
WHERE hp.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.created_by = hp.user_id
      AND g.category = 'Host Community'
      AND g.name = COALESCE(NULLIF(hp.business_name, ''), hp.legal_name)
  );

INSERT INTO public.group_members (group_id, user_id)
SELECT g.id, g.created_by
FROM public.groups g
JOIN auth.users u ON u.id = g.created_by
WHERE g.category = 'Host Community'
ON CONFLICT DO NOTHING;