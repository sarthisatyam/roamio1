
-- Recurrence + locations + traveller phones
ALTER TABLE public.community_trips
  ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS recurrence_days integer[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recurrence_dates date[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS duration_nights integer,
  ADD COLUMN IF NOT EXISTS pickup_location text,
  ADD COLUMN IF NOT EXISTS dropoff_location text;

ALTER TABLE public.community_bookings
  ADD COLUMN IF NOT EXISTS billing_details jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS departure_date date;

-- Update uniqueness trigger: skip overlap check for recurring trips (they intentionally repeat)
CREATE OR REPLACE FUNCTION public.enforce_host_trip_uniqueness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_overlap int;
  v_same_itin record;
  v_same_price record;
BEGIN
  IF COALESCE(NEW.recurrence_type, 'one_time') = 'one_time' THEN
    SELECT count(*) INTO v_overlap
    FROM community_trips
    WHERE host_id = NEW.host_id
      AND lower(destination) = lower(NEW.destination)
      AND COALESCE(recurrence_type, 'one_time') = 'one_time'
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND daterange(start_date, end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]');
    IF v_overlap > 0 THEN
      RAISE EXCEPTION 'You already have a trip to % on overlapping dates. Pick different dates.', NEW.destination;
    END IF;
  END IF;

  SELECT id, price_inr INTO v_same_itin
  FROM community_trips
  WHERE host_id = NEW.host_id
    AND lower(destination) = lower(NEW.destination)
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND md5(coalesce(itinerary::text,'[]')) = md5(coalesce(NEW.itinerary::text,'[]'))
  LIMIT 1;

  IF v_same_itin.id IS NOT NULL THEN
    IF v_same_itin.price_inr <> NEW.price_inr THEN
      RAISE EXCEPTION 'Same itinerary for % must use the same price (₹%).', NEW.destination, v_same_itin.price_inr;
    END IF;
  ELSE
    SELECT id INTO v_same_price
    FROM community_trips
    WHERE host_id = NEW.host_id
      AND lower(destination) = lower(NEW.destination)
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND price_inr = NEW.price_inr
    LIMIT 1;
    IF v_same_price.id IS NOT NULL THEN
      RAISE EXCEPTION 'A different itinerary for % must use a different price.', NEW.destination;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update booking RPC to accept billing + departure_date
CREATE OR REPLACE FUNCTION public.book_community_trip(
  p_trip_id uuid,
  p_seats integer,
  p_contact_phone text,
  p_emergency jsonb,
  p_travellers jsonb DEFAULT '[]'::jsonb,
  p_billing jsonb DEFAULT '{}'::jsonb,
  p_departure_date date DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid;
  v_trip record;
  v_host record;
  v_group_id uuid;
  v_booking_id uuid;
  v_amount integer;
  v_commission integer;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_seats < 1 THEN RAISE EXCEPTION 'Seats must be >= 1'; END IF;

  SELECT * INTO v_trip FROM community_trips WHERE id = p_trip_id FOR UPDATE;
  IF v_trip IS NULL THEN RAISE EXCEPTION 'Trip not found'; END IF;
  IF v_trip.status <> 'published' THEN RAISE EXCEPTION 'Trip not bookable'; END IF;
  IF v_trip.seats_left < p_seats THEN RAISE EXCEPTION 'Not enough seats'; END IF;

  SELECT * INTO v_host FROM host_profiles WHERE id = v_trip.host_id;

  v_amount := v_trip.price_inr * p_seats;
  v_commission := ROUND(v_amount * COALESCE(v_host.commission_pct, 8.0) / 100.0);

  v_group_id := v_trip.group_id;
  IF v_group_id IS NULL THEN
    INSERT INTO groups (name, description, category, icon, created_by)
    VALUES (v_trip.title, 'Hosted trip chat for ' || v_trip.destination, 'Host Trip', 'Tent', v_host.user_id)
    RETURNING id INTO v_group_id;
    UPDATE community_trips SET group_id = v_group_id WHERE id = p_trip_id;
    INSERT INTO group_members (group_id, user_id) VALUES (v_group_id, v_host.user_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO group_members (group_id, user_id) VALUES (v_group_id, v_user) ON CONFLICT DO NOTHING;

  INSERT INTO community_bookings (
    trip_id, user_id, seats, amount_paid, commission_amount,
    contact_phone, emergency_contact, travellers, billing_details, departure_date, status
  ) VALUES (
    p_trip_id, v_user, p_seats, v_amount, v_commission,
    p_contact_phone, p_emergency, p_travellers, p_billing, p_departure_date, 'paid'
  ) RETURNING id INTO v_booking_id;

  -- Only decrement seats for one-time trips
  IF COALESCE(v_trip.recurrence_type, 'one_time') = 'one_time' THEN
    UPDATE community_trips
    SET seats_left = seats_left - p_seats,
        status = CASE WHEN seats_left - p_seats <= 0 THEN 'closed' ELSE status END
    WHERE id = p_trip_id;
  END IF;

  RETURN v_booking_id;
END;
$function$;
