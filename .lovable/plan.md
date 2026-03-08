

## Plan: Revamp Home Page — Popular Destinations, New Categories & AI-First Search

### Changes to `src/components/pages/HomePage.tsx`

**1. Remove Hotspots**
- Delete the `hotspots` array (lines 271-328), `filteredHotspots`, `selectedHotspot` state, `getHotspotPlatforms`, and the `BookingDialog` usage. Remove all hotspot-related imports (`Music`, `Laugh`, `UtensilsCrossed`, `Palette`, `Radio`).

**2. Rename "Safe Destinations" → "Popular Destinations"**
- Change heading to "Popular Destinations" with subtitle "Trending nearby places"
- Remove hardcoded destinations array (Goa, Manali, Udaipur)
- Instead, use the AI search edge function to fetch popular destinations based on user's current city on mount (e.g., call `supabase.functions.invoke('search-generator', { body: { query: "popular destinations near {currentCity}", pageContext: "home" } })`)
- Store results in state and render them using the existing destination card layout
- Show a loading skeleton while fetching
- If location is disabled, show a prompt to enable it or fall back to "popular destinations in India"

**3. Replace Quick Access Categories**
- Remove old commented-out categories (Cafes, Shopping, Attractions, More, Petrol, Clinics, Museums, Restaurants)
- Add new categories: **Safe Places** (`Shield`), **Solo-Friendly** (`Compass`), **Women-Safe** (`Users`)
- Tapping a category sets the search query to that label, triggering AI search results below

**4. Make Search Bar AI-First**
- Currently: filters static destinations first, falls back to AI only when no static matches
- New behavior: since destinations are now dynamic, ALL searches go through the AI search flow
- When user types in search bar, show `AISearchResults` component directly with the query
- Remove `filteredDestinations` logic entirely
- When AI results include destinations, show them in-place replacing the popular destinations section

### Files Modified
- `src/components/pages/HomePage.tsx` — all changes in this single file

### Technical Notes
- Reuses existing `useAISearch` hook and `AISearchResults` component
- Reuses existing `search-generator` edge function
- Popular destinations fetched once on mount (or when city changes) via a separate `useEffect` calling the edge function directly
- Results cached in component state; no new hooks needed

