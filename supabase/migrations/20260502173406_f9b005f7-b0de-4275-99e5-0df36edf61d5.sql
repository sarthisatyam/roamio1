-- ============== Roles ==============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'host', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============== host_profiles ==============
CREATE TABLE IF NOT EXISTS public.host_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  legal_name text NOT NULL,
  business_name text,
  gstin text,
  city text,
  bio text,
  experience_years integer DEFAULT 0,
  social_links jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'approved', -- auto-approve v1
  rating numeric(3,2) DEFAULT 0,
  total_trips integer DEFAULT 0,
  commission_pct numeric(5,2) NOT NULL DEFAULT 8.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated views approved hosts" ON public.host_profiles
  FOR SELECT TO authenticated USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users create own host profile" ON public.host_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts update own profile" ON public.host_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-grant host role + auto-approve
CREATE OR REPLACE FUNCTION public.grant_host_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'host')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_grant_host_role ON public.host_profiles;
CREATE TRIGGER trg_grant_host_role AFTER INSERT ON public.host_profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_host_role();

CREATE TRIGGER trg_host_profiles_updated_at BEFORE UPDATE ON public.host_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== community_trips ==============
CREATE TABLE IF NOT EXISTS public.community_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text NOT NULL,
  latitude numeric,
  longitude numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price_inr integer NOT NULL,
  seats_total integer NOT NULL,
  seats_left integer NOT NULL,
  group_type text NOT NULL DEFAULT 'co-ed', -- women-only / co-ed / male-only
  trip_type text NOT NULL DEFAULT 'leisure',
  languages text[] DEFAULT ARRAY['English','Hindi'],
  itinerary jsonb DEFAULT '[]'::jsonb,
  inclusions text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}',
  meeting_point text,
  cancellation_policy text,
  cover_url text,
  gallery_urls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'published', -- draft/published/sold_out/closed/completed/archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_trips ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_community_trips_status ON public.community_trips(status);
CREATE INDEX IF NOT EXISTS idx_community_trips_dates ON public.community_trips(start_date);

CREATE POLICY "Anyone authenticated views published trips" ON public.community_trips
  FOR SELECT TO authenticated
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.host_profiles hp
    WHERE hp.id = community_trips.host_id AND hp.user_id = auth.uid()
  ));

CREATE POLICY "Hosts create trips" ON public.community_trips
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'host')
    AND EXISTS (SELECT 1 FROM public.host_profiles hp WHERE hp.id = host_id AND hp.user_id = auth.uid())
  );

CREATE POLICY "Owning host updates trip" ON public.community_trips
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.host_profiles hp WHERE hp.id = host_id AND hp.user_id = auth.uid()));

CREATE POLICY "Owning host deletes trip" ON public.community_trips
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.host_profiles hp WHERE hp.id = host_id AND hp.user_id = auth.uid()));

CREATE TRIGGER trg_community_trips_updated_at BEFORE UPDATE ON public.community_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== community_bookings ==============
CREATE TABLE IF NOT EXISTS public.community_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.community_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  seats integer NOT NULL DEFAULT 1,
  amount_paid integer NOT NULL DEFAULT 0,
  commission_amount integer NOT NULL DEFAULT 0,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending', -- pending/paid/cancelled/refunded
  contact_phone text,
  emergency_contact jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_bookings_trip ON public.community_bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.community_bookings(user_id);

CREATE POLICY "Travellers view own bookings" ON public.community_bookings
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.community_trips ct
      JOIN public.host_profiles hp ON hp.id = ct.host_id
      WHERE ct.id = community_bookings.trip_id AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Travellers create own bookings" ON public.community_bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Travellers cancel own bookings" ON public.community_bookings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_community_bookings_updated_at BEFORE UPDATE ON public.community_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== host_reviews ==============
CREATE TABLE IF NOT EXISTS public.host_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.community_trips(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.community_bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);
ALTER TABLE public.host_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated views reviews" ON public.host_reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Bookers create reviews for own paid bookings" ON public.host_reviews
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.community_bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid() AND b.status = 'paid'
    )
  );