

## Plan: AI-Powered Price Comparison for Hotels

### Problem
The current "Compare" feature uses hardcoded prices for only 3 hotel IDs. It doesn't work for AI-generated hotel results at all.

### Solution
Create a new edge function `compare-prices` that uses Lovable AI to generate realistic price comparisons across MakeMyTrip, Goibibo, and Agoda for any hotel. Add a "Compare" button to AI hotel results too.

### Changes

**1. New edge function: `supabase/functions/compare-prices/index.ts`**
- Accepts hotel name, location, and base price
- Uses Lovable AI (gemini-2.5-flash) to generate realistic price comparisons across MakeMyTrip, Goibibo, and Agoda
- Returns structured JSON with platform name, price, savings, and booking URL

**2. Update `supabase/config.toml`**
- Add `[functions.compare-prices]` with `verify_jwt = false`

**3. Update `src/components/pages/BookingsPage.tsx`**
- Remove the hardcoded `stayComparisons` object and `getBestPrice` function
- Add state for AI-fetched comparisons: `aiComparisons` map and `loadingCompareId`
- When user clicks "Compare" on any hotel (API or AI), call the `compare-prices` edge function
- Cache results so re-clicking doesn't re-fetch
- Add "Compare" button to AI hotel cards (currently only have "Book" and "Map")
- Display the comparison UI inline for both API and AI hotel cards using the same format

### Technical Details
- The edge function prompt will ask AI to estimate real platform prices based on hotel name, star rating, and location
- Prices will include realistic variance (e.g., MakeMyTrip slightly cheaper, Agoda slightly higher)
- Booking links will be Google search URLs with platform name included
- Response is cached client-side per hotel to avoid redundant calls

