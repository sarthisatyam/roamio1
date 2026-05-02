
# PRD: Community Travel (Organiser-Hosted Trips)

## 1. Background & Why

Roamio currently supports two modes: **Solo** (use app features alone) and **Group** (join or create peer plans). Adoption is slow because there is no supply-side flywheel — every trip depends on another traveller showing up.

**Community Travel** adds a third supply source: verified hosts (experienced organisers, freelance trip leaders, registered travel agencies) who publish curated paid trips. Travellers book a seat; Roamio takes a commission per booking.

This unlocks:
- **Instant inventory** — travellers see ready-to-book trips on day one.
- **B2B acquisition** — every onboarded organiser brings their existing audience.
- **Revenue** — first monetisable surface beyond the freemium model.

## 2. The Four Traveller Choices (post-launch)

When a user opens Roamio they can:

1. **Travel solo** — use discovery, AI guide, bookings, safety features (existing).
2. **Join a peer group** — discover plans created by other travellers (existing).
3. **Create a peer group** — gather like-minded travellers (existing).
4. **Join a community trip** — book a seat on an organiser-hosted trip (NEW).

## 3. Goals & Non-Goals

**Goals**
- Let verified hosts publish, manage and sell seats on trips.
- Let travellers discover, compare and book community trips inside the existing Companion tab.
- Collect commission automatically at booking time.
- Keep identity of fellow bookers private until host approves / trip starts.

**Non-Goals (v1)**
- No host-to-host marketplace, no trip insurance, no refunds engine beyond a simple cancellation policy field.
- No in-app payouts dashboard for hosts in v1 (CSV export + manual payout).
- No multi-currency — INR only at launch.

## 4. Personas

- **Riya, 24, solo traveller** — wants a curated Himachal trip without planning effort.
- **TrailMakers, small agency** — already runs 2 trips/month via Instagram + Google Forms. Wants a discovery channel and structured bookings.
- **Arjun, freelance trip leader** — runs occasional weekend trips, needs payment collection without building a website.

## 5. Core Concepts

```text
Host (verified)
  └── Community Trip (published listing)
        ├── Itinerary (day-by-day)
        ├── Inclusions / Exclusions
        ├── Pricing & seat inventory
        ├── Cancellation policy
        └── Bookings (seat reservations + payment)
              └── Traveller (joined; identity hidden from peers)
```

## 6. Feature Scope (v1)

### 6.1 Host onboarding
- New role `host` in user_roles.
- Apply-to-host form: legal name, business name (optional), GSTIN (optional), city, years of experience, sample itineraries, ID upload, social/website links.
- Admin review → approve/reject. Approved hosts see a **Host Dashboard** entry in Account.

### 6.2 Trip listing (host side)
Required fields: title, destination, start/end dates, group size (min/max seats), price per seat, group type (women-only / co-ed / male-only), trip type (trek/road trip/etc.), languages, day-by-day itinerary, inclusions, exclusions, meeting point, cancellation policy, cover photo + gallery, host bio snapshot.

States: `draft → published → sold_out / closed → completed → archived`.

### 6.3 Discovery (traveller side)
- New **Community** sub-tab inside Companion page (alongside Discover / Groups / Community-feed).
- Filters via existing Popover pattern: destination, date range, price range, group type, trip type, duration, host verified-only.
- Card shows: cover, title, host name + verified badge + rating, dates, duration, price/seat, seats left, tags. **Does NOT show who has booked.**
- Compare tray: select up to 3 trips → side-by-side comparison sheet (price, duration, inclusions, group size, host rating).

### 6.4 Trip detail page
- Hero, full itinerary (collapsible per day), inclusions/exclusions, meeting point map, cancellation policy, host profile card (other trips by host, rating, completed-trip count), FAQs.
- "X seats left" + price + **Book a seat** CTA.
- Reviews from past completed trips by same host.

### 6.5 Booking & payment
- Traveller taps Book → seat-count selector (default 1) → contact + emergency contact form → **Pay** screen.
- Payment via Lovable Payments (Stripe checkout session) — Roamio is merchant of record at v1, commission split handled by post-payout settlement.
- Commission: configurable per host (default 8%). Stored on each booking row at time of payment.
- On success: booking confirmed, seat inventory decremented atomically, traveller added to a **private trip group chat** (sync_plan_group_members style RPC), host notified.

### 6.6 Privacy of co-bookers
- Booking list visible only to host until trip start date.
- 24h before start: members of the booking are revealed inside the trip group chat (display name + avatar only; no contact info).

### 6.7 Host dashboard
- List of trips with status, seats sold, gross revenue, commission, net payable.
- Per-trip: roster (name, contact, emergency contact, paid amount), broadcast message, mark trip completed.
- CSV export of bookings.

### 6.8 Reviews
- After trip `completed`, each booker gets a prompt to rate host (1–5) + optional review.
- Host rating = average across all completed trips.

### 6.9 Notifications (in-app + email via existing send-contact-email pattern)
- Host: new booking, cancellation, trip 48h reminder.
- Traveller: booking confirmed, payment receipt, 7-day reminder, 24h reveal of co-travellers, post-trip review prompt.

## 7. User Flows

### 7.1 Traveller — discover & book

```text
Home/Companion tab
   └── Tap "Community" sub-tab
         └── Browse / filter / compare
               └── Tap card → Trip detail
                     └── Tap "Book a seat"
                           ├── Not logged in → Auth flow → return
                           └── Seat count + contact form
                                 └── Stripe checkout
                                       ├── Success → Confirmation → added to trip chat
                                       └── Failure → retry / contact host
```

### 7.2 Decision point on Home (the "4 options")

After sign-in the Home hero shows a single primary action **Plan your next trip** that opens a chooser sheet:

```text
How do you want to travel?
  ┌──────────────────────────────────────────┐
  │  Solo            → enter discovery        │
  │  Join a group    → peer group list        │
  │  Create a group  → PlanBuilder            │
  │  Join a community trip → Community list  │  (NEW)
  └──────────────────────────────────────────┘
```

### 7.3 Host — onboard & publish

```text
Account → Become a Host → Application form → Submit
   └── Admin approves (manual v1)
         └── Host Dashboard unlocked
               └── Create Trip → fill listing → Publish
                     └── Bookings stream in → manage roster → mark completed
                           └── Receive payout (manual settlement v1)
```

### 7.4 Cancellation (traveller)
Detail page → My Bookings → Cancel → policy-based refund calculated → confirm → seat returned to inventory → host notified.

## 8. Success Metrics (first 90 days)

- 25 verified hosts onboarded.
- 100 community trips published.
- 500 paid seat bookings.
- ≥ 30% of new sign-ups choose "Join a community trip" as first action.
- Commission revenue ≥ ₹1.5L/month by month 3.

## 9. Risks & Mitigations

- **Host quality / fraud** → mandatory ID + manual approval + rating system + ability to suspend hosts.
- **Payment disputes** → cancellation policy required at listing time; surface it on detail + confirmation; keep Stripe as MoR.
- **Cold start (no bookings)** → seed 10 hosts manually before public launch; show "X seats sold this week" social proof per trip once live.
- **Cannibalising peer groups** → keep Community visually distinct (organiser badge, price tag) so users self-select.

## 10. Technical Outline (for the build phase)

**New tables**
- `host_profiles` (user_id, business_name, gstin, bio, status, rating, total_trips, commission_pct, …)
- `community_trips` (host_id, title, destination, lat/lng, start_date, end_date, price_inr, seats_total, seats_left, group_type, trip_type, itinerary jsonb, inclusions[], exclusions[], meeting_point, cancellation_policy, cover_url, gallery_urls[], status, created_at)
- `community_bookings` (trip_id, user_id, seats, amount_paid, commission_amount, stripe_session_id, status [pending/paid/cancelled/refunded], contact_phone, emergency_contact, created_at)
- `host_reviews` (trip_id, booking_id, reviewer_id, rating, comment, created_at)
- `user_roles` extended with `host` enum value (uses the existing `has_role` security-definer pattern).

**RLS highlights**
- `community_trips`: anyone authenticated can SELECT published; only owning host can UPDATE/DELETE; only `has_role(uid,'host')` can INSERT.
- `community_bookings`: traveller can SELECT own; host can SELECT bookings on their trips; INSERT only via edge function after Stripe webhook.
- `host_profiles`: host can SELECT/UPDATE own; public can SELECT approved subset via a view that hides PII.

**Edge functions**
- `create-trip-checkout` — builds Stripe session, reserves seat (status `pending` with TTL).
- `stripe-webhook` — confirms booking, decrements seats atomically, adds user to trip group via `sync_plan_group_members` analogue.
- `host-payout-export` — CSV of completed-trip net payouts.

**Frontend additions**
- `src/components/pages/CommunityTripsPage.tsx` (new sub-tab inside CompanionPage tabs).
- `src/components/community/TripCard.tsx`, `TripDetailDialog.tsx`, `CompareTray.tsx`, `BookingFlow.tsx`.
- `src/components/host/HostDashboard.tsx`, `TripBuilder.tsx` (mirrors existing PlanBuilder UX).
- New hooks: `useCommunityTrips`, `useHostTrips`, `useBookings`.
- Account page gets **Become a Host** entry (gated by role check).

**Payments**
- Enable Lovable's built-in Stripe payments before any code — required for booking flow.

**Out of scope for v1 build ticket:** reviews surfacing on host profile (data captured, UI in v1.1), CSV payout automation, refund automation beyond status flag.

## 11. Phased Rollout

- **Phase 1 (build):** host application + admin approval + trip listing + discovery + booking + Stripe checkout + private trip chat.
- **Phase 2:** compare tray, reviews UI, host analytics, automated reminders.
- **Phase 3:** auto-payouts, multi-currency, traveller-side wishlists for community trips.

