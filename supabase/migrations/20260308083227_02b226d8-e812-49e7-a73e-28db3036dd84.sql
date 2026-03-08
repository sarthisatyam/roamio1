
CREATE TABLE public.journey_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send journey invites"
  ON public.journey_invites FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their journey invites"
  ON public.journey_invites FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Recipients can update journey invites"
  ON public.journey_invites FOR UPDATE
  USING (auth.uid() = to_user_id);
