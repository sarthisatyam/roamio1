
ALTER TABLE public.community_trips ADD COLUMN IF NOT EXISTS group_id uuid;

-- Allow group members to view a community-trip group (RLS already covers via group_members)
-- New RPC to atomically book a seat
CREATE OR REPLACE FUNCTION public.book_community_trip(
  p_trip_id uuid,
  p_seats integer,
  p_contact_phone text,
  p_emergency jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_seats < 1 THEN
    RAISE EXCEPTION 'Seats must be >= 1';
  END IF;

  SELECT * INTO v_trip FROM community_trips WHERE id = p_trip_id FOR UPDATE;
  IF v_trip IS NULL THEN RAISE EXCEPTION 'Trip not found'; END IF;
  IF v_trip.status <> 'published' THEN RAISE EXCEPTION 'Trip not bookable'; END IF;
  IF v_trip.seats_left < p_seats THEN RAISE EXCEPTION 'Not enough seats'; END IF;

  SELECT * INTO v_host FROM host_profiles WHERE id = v_trip.host_id;

  v_amount := v_trip.price_inr * p_seats;
  v_commission := ROUND(v_amount * COALESCE(v_host.commission_pct, 8.0) / 100.0);

  -- Ensure trip group exists
  v_group_id := v_trip.group_id;
  IF v_group_id IS NULL THEN
    INSERT INTO groups (name, description, category, icon, created_by)
    VALUES (v_trip.title, 'Community trip chat for ' || v_trip.destination, 'Community', 'Mountain', v_host.user_id)
    RETURNING id INTO v_group_id;
    UPDATE community_trips SET group_id = v_group_id WHERE id = p_trip_id;
    -- Add host as member
    INSERT INTO group_members (group_id, user_id) VALUES (v_group_id, v_host.user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add traveller to group
  INSERT INTO group_members (group_id, user_id) VALUES (v_group_id, v_user)
  ON CONFLICT DO NOTHING;

  -- Create booking (status paid since payments deferred)
  INSERT INTO community_bookings (
    trip_id, user_id, seats, amount_paid, commission_amount,
    contact_phone, emergency_contact, status
  ) VALUES (
    p_trip_id, v_user, p_seats, v_amount, v_commission,
    p_contact_phone, p_emergency, 'paid'
  ) RETURNING id INTO v_booking_id;

  -- Decrement seats
  UPDATE community_trips
  SET seats_left = seats_left - p_seats,
      status = CASE WHEN seats_left - p_seats <= 0 THEN 'closed' ELSE status END
  WHERE id = p_trip_id;

  RETURN v_booking_id;
END;
$$;
