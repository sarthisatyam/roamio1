
-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trip_type TEXT NOT NULL, -- darshan, trek, relaxed, adventure, spiritual
  budget_range TEXT NOT NULL, -- budget, mid-range, premium
  group_type TEXT NOT NULL, -- women-only, mixed, family
  max_members INTEGER NOT NULL DEFAULT 6,
  trip_style TEXT, -- spiritual, relaxed, adventure
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open, full, started, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view open trips"
ON public.trips FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create trips"
ON public.trips FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their trips"
ON public.trips FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their trips"
ON public.trips FOR DELETE
USING (auth.uid() = created_by);

-- Create trip_members table
CREATE TABLE public.trip_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, member
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view trip members"
ON public.trip_members FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can join as themselves"
ON public.trip_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave trips"
ON public.trip_members FOR DELETE
USING (auth.uid() = user_id);

-- Create trip_requests table
CREATE TABLE public.trip_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  answers JSONB, -- structured question answers
  message TEXT,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
ON public.trip_requests FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.trip_members
  WHERE trip_members.trip_id = trip_requests.trip_id
  AND trip_members.user_id = auth.uid()
  AND trip_members.role = 'owner'
));

CREATE POLICY "Users can create requests"
ON public.trip_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trip owners can update requests"
ON public.trip_requests FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.trip_members
  WHERE trip_members.trip_id = trip_requests.trip_id
  AND trip_members.user_id = auth.uid()
  AND trip_members.role = 'owner'
));

-- Create trip_messages table (trip-scoped group chat)
CREATE TABLE public.trip_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view messages"
ON public.trip_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.trip_members
  WHERE trip_members.trip_id = trip_messages.trip_id
  AND trip_members.user_id = auth.uid()
));

CREATE POLICY "Trip members can send messages"
ON public.trip_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_members.trip_id = trip_messages.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

-- Enable realtime for trip messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_requests_updated_at
BEFORE UPDATE ON public.trip_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
