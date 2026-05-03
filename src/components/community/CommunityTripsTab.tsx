import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Calendar, Users, Star, ShieldCheck, Filter,
  IndianRupee, Clock, Loader2, Sparkles, Mountain, X,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useCommunityTrips, CommunityTrip } from "@/hooks/useCommunityTrips";
import { cn } from "@/lib/utils";
import BookingFlowDialog from "./BookingFlowDialog";

const GROUP_TYPES = ["all", "co-ed", "women-only", "male-only"];
const TRIP_TYPES = ["all", "trek", "road trip", "leisure", "adventure", "cultural", "spiritual"];

interface Props {
  searchQuery: string;
}

const CommunityTripsTab: React.FC<Props> = ({ searchQuery }) => {
  const { trips, loading, refetch } = useCommunityTrips();
  const [selectedTrip, setSelectedTrip] = useState<CommunityTrip | null>(null);
  const [groupType, setGroupType] = useState("all");
  const [tripType, setTripType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(50000);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trips.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q)) return false;
      if (groupType !== "all" && t.group_type !== groupType) return false;
      if (tripType !== "all" && t.trip_type !== tripType) return false;
      if (t.price_inr > maxPrice) return false;
      return true;
    });
  }, [trips, searchQuery, groupType, tripType, maxPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full text-xs h-8 shrink-0 gap-1.5">
              <Filter className="w-3 h-3" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 space-y-4" align="start">
            <div>
              <p className="text-xs font-medium mb-2">Group type</p>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_TYPES.map((g) => (
                  <Badge
                    key={g}
                    variant={groupType === g ? "default" : "outline"}
                    className="cursor-pointer text-[10px] capitalize"
                    onClick={() => setGroupType(g)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Trip type</p>
              <div className="flex flex-wrap gap-1.5">
                {TRIP_TYPES.map((t) => (
                  <Badge
                    key={t}
                    variant={tripType === t ? "default" : "outline"}
                    className="cursor-pointer text-[10px] capitalize"
                    onClick={() => setTripType(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Max price: ₹{maxPrice.toLocaleString()}</p>
              <Slider
                value={[maxPrice]}
                onValueChange={(v) => setMaxPrice(v[0])}
                min={2000}
                max={100000}
                step={1000}
              />
            </div>
          </PopoverContent>
        </Popover>
        {groupType !== "all" && (
          <Badge variant="secondary" className="text-[10px] capitalize gap-1">
            {groupType}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setGroupType("all")} />
          </Badge>
        )}
        {tripType !== "all" && (
          <Badge variant="secondary" className="text-[10px] capitalize gap-1">
            {tripType}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setTripType("all")} />
          </Badge>
        )}
      </div>

      {/* Trip list */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Mountain className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">No trips match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try widening the filters or check back soon.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} onOpen={() => setSelectedTrip(trip)} />
          ))}
        </div>
      )}

      <TripDetailDialog
        trip={selectedTrip}
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onBooked={refetch}
      />
    </div>
  );
};

// ===================== Card =====================

const TripCard: React.FC<{ trip: CommunityTrip; onOpen: () => void }> = ({ trip, onOpen }) => {
  const days = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const seatsLowPct = trip.seats_left / Math.max(trip.seats_total, 1);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-elegant transition-shadow"
      onClick={onOpen}
    >
      <div className="relative h-36 bg-gradient-hero">
        {trip.cover_url ? (
          <img src={trip.cover_url} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-10 h-10 text-primary-foreground/60" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] gap-1">
          <Sparkles className="w-3 h-3" />
          Hosted Trip
        </Badge>
        {seatsLowPct <= 0.3 && trip.seats_left > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">
            {trip.seats_left} left
          </Badge>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{trip.title}</h3>
          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[11px] font-medium">{trip.host?.rating?.toFixed(1) ?? "New"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="truncate">
            {trip.host?.business_name || trip.host?.legal_name || "Verified host"}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(trip.start_date), "d MMM")} • {days}D</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trip.seats_left}/{trip.seats_total}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-primary font-bold text-sm">
            <IndianRupee className="w-3.5 h-3.5" />
            {trip.price_inr.toLocaleString()}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">/seat</span>
          </div>
          <Badge variant="outline" className="text-[10px] capitalize">{trip.group_type}</Badge>
        </div>
      </div>
    </Card>
  );
};

// ===================== Detail Dialog =====================

const TripDetailDialog: React.FC<{
  trip: CommunityTrip | null;
  open: boolean;
  onClose: () => void;
}> = ({ trip, open, onClose }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { refetch } = useCommunityTrips();
  if (!trip) return null;
  const days = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];

  const handleBook = () => setBookingOpen(true);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative h-44 bg-gradient-hero">
          {trip.cover_url ? (
            <img src={trip.cover_url} alt={trip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Mountain className="w-12 h-12 text-primary-foreground/60" />
            </div>
          )}
        </div>
        <div className="p-4 space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base">{trip.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              {trip.host?.business_name || trip.host?.legal_name}
              {trip.host?.city && <span> • {trip.host.city}</span>}
            </DialogDescription>
          </DialogHeader>

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Card className="p-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium">{format(new Date(trip.start_date), "d MMM")}</p>
                <p className="text-[10px] text-muted-foreground">{days} days</p>
              </div>
            </Card>
            <Card className="p-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium">{trip.seats_left} seats left</p>
                <p className="text-[10px] text-muted-foreground capitalize">{trip.group_type}</p>
              </div>
            </Card>
            <Card className="p-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium truncate">{trip.destination}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{trip.trip_type}</p>
              </div>
            </Card>
            <Card className="p-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium">₹{trip.price_inr.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">per seat</p>
              </div>
            </Card>
          </div>

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Itinerary
              </p>
              <div className="space-y-2">
                {itinerary.map((d: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-3 py-0.5">
                    <p className="text-xs font-medium">Day {d.day || i + 1}: {d.title}</p>
                    {d.description && (
                      <p className="text-[11px] text-muted-foreground">{d.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          <div className="grid grid-cols-2 gap-3">
            {!!trip.inclusions?.length && (
              <div>
                <p className="text-xs font-semibold mb-1 text-emerald-600">Includes</p>
                <ul className="text-[11px] space-y-0.5 text-muted-foreground">
                  {trip.inclusions.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
              </div>
            )}
            {!!trip.exclusions?.length && (
              <div>
                <p className="text-xs font-semibold mb-1 text-rose-600">Excludes</p>
                <ul className="text-[11px] space-y-0.5 text-muted-foreground">
                  {trip.exclusions.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
              </div>
            )}
          </div>

          {trip.meeting_point && (
            <div>
              <p className="text-xs font-semibold mb-1">Meeting point</p>
              <p className="text-[11px] text-muted-foreground">{trip.meeting_point}</p>
            </div>
          )}

          {trip.cancellation_policy && (
            <div>
              <p className="text-xs font-semibold mb-1">Cancellation policy</p>
              <p className="text-[11px] text-muted-foreground">{trip.cancellation_policy}</p>
            </div>
          )}

          {/* Sticky CTA */}
          <div className={cn("sticky bottom-0 bg-background pt-2 -mx-4 px-4 pb-1 flex items-center justify-between gap-3 border-t")}>
            <div>
              <p className="text-[10px] text-muted-foreground">Total / seat</p>
              <p className="text-base font-bold flex items-center text-primary">
                <IndianRupee className="w-4 h-4" />{trip.price_inr.toLocaleString()}
              </p>
            </div>
            <Button onClick={handleBook} className="flex-1" disabled={trip.seats_left === 0}>
              {trip.seats_left === 0 ? "Sold out" : "Book a seat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityTripsTab;
