
-- Plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  plan_name text NOT NULL,
  destination_name text NOT NULL,
  latitude numeric,
  longitude numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  max_members integer NOT NULL DEFAULT 6,
  group_type text NOT NULL DEFAULT 'everyone',
  plan_visibility text NOT NULL DEFAULT 'public',
  trip_description text,
  cover_image_url text,
  interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view public plans" ON public.plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create plans" ON public.plans
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their plans" ON public.plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their plans" ON public.plans
  FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- Plan members table
CREATE TABLE public.plan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'approved',
  joined_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view plan members" ON public.plan_members
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join as themselves" ON public.plan_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Plan owners can add members" ON public.plan_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.plan_members pm
    WHERE pm.plan_id = plan_members.plan_id AND pm.user_id = auth.uid() AND pm.role = 'owner'
  ));

CREATE POLICY "Users can leave plans" ON public.plan_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Join requests table
CREATE TABLE public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create join requests" ON public.join_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own or owned plan requests" ON public.join_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.plan_members
      WHERE plan_members.plan_id = join_requests.plan_id
        AND plan_members.user_id = auth.uid()
        AND plan_members.role = 'owner'
    )
  );

CREATE POLICY "Plan owners can update requests" ON public.join_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_members
      WHERE plan_members.plan_id = join_requests.plan_id
        AND plan_members.user_id = auth.uid()
        AND plan_members.role = 'owner'
    )
  );

-- Co-companions table
CREATE TABLE public.co_companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  companion_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, companion_id)
);

ALTER TABLE public.co_companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their co-companions" ON public.co_companions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = companion_id);

CREATE POLICY "System can insert co-companions" ON public.co_companions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for trip covers
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-covers', 'trip-covers', true);

CREATE POLICY "Anyone can view trip covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-covers');

CREATE POLICY "Authenticated users can upload trip covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-covers');

-- Enable realtime for plans
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;
