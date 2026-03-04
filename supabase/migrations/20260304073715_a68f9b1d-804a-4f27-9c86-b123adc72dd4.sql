
-- Store parent/guardian details per user
CREATE TABLE public.parental_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Store parental control settings per user
CREATE TABLE public.parental_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  location_sharing BOOLEAN NOT NULL DEFAULT false,
  trip_notifications BOOLEAN NOT NULL DEFAULT false,
  sos_alerts BOOLEAN NOT NULL DEFAULT false,
  checkin_reminders BOOLEAN NOT NULL DEFAULT false,
  restrict_late_bookings BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Location logs sent periodically
CREATE TABLE public.parental_location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOS alerts
CREATE TABLE public.parental_sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'triggered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip update notifications
CREATE TABLE public.parental_trip_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  update_type TEXT NOT NULL, -- 'start' or 'end'
  trip_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.parental_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_trip_updates ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users manage own guardians" ON public.parental_guardians FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own settings" ON public.parental_settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own location logs" ON public.parental_location_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own sos alerts" ON public.parental_sos_alerts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own trip updates" ON public.parental_trip_updates FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
