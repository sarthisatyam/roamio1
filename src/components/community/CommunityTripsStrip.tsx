import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Users, Star, ShieldCheck,
  IndianRupee, Clock, Loader2, Sparkles, Mountain,
  Moon, Sun, Repeat, ArrowRightLeft, X,
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { useCommunityTrips, CommunityTrip } from "@/hooks/useCommunityTrips";
import { cn } from "@/lib/utils";
import BookingFlowDialog from "./BookingFlowDialog";
import { toast } from "sonner";

const DOW_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const tripNights = (t: CommunityTrip) => {
  if (t.duration_nights && t.duration_nights > 0) return t.duration_nights;
  return Math.max(1, differenceInDays(new Date(t.end_date), new Date(t.start_date)));
};
const tripDays = (t: CommunityTrip) => tripNights(t) + 1;

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const upcomingDates = (t: CommunityTrip, max = 3): string[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (t.recurrence_type === "custom" && t.recurrence_dates?.length) {
    return t.recurrence_dates
      .map((s) => new Date(s))
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime())
      .slice(0, max)
      .map(fmtDate);
  }
  if (t.recurrence_type === "weekly" && t.recurrence_days?.length) {
    const out: Date[] = [];
    for (let i = 0; i < 60 && out.length < max; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (t.recurrence_days.includes(d.getDay())) out.push(d);
    }
    return out.map(fmtDate);
  }
  return [fmtDate(new Date(t.start_date))];
};

const scheduleLabel = (t: CommunityTrip) => {
  const dates = upcomingDates(t, 3);
  if (dates.length) return `Starts ${dates.join(" • ")}`;
  return `${tripNights(t)}N / ${tripDays(t)}D`;
};

const CommunityTripsStrip: React.FC = () => {
  const { trips, loading, refetch } = useCommunityTrips();
  const [selectedTrip, setSelectedTrip] = useState<CommunityTrip | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) {
        toast.error("You can compare up to 4 trips");
        return prev;
      }
      return [...prev, id];
    });
  };

  const compareTrips = useMemo(
    () => trips.filter(t => compareIds.includes(t.id)),
    [trips, compareIds]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold">Community Trips</h2>
        <div className="flex items-center gap-1">
          {compareMode && (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                onClick={() => { setCompareMode(false); setCompareIds([]); }}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-[11px] gap-1"
                disabled={compareIds.length < 2}
                onClick={() => setCompareOpen(true)}>
                Compare ({compareIds.length})
              </Button>
            </>
          )}
          {!compareMode && (
            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-lg"
              onClick={() => setCompareMode(true)} disabled={trips.length < 2}>
              <ArrowRightLeft className="w-3 h-3" /> Compare
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-6 text-center rounded-2xl border-0 shadow-soft">
          <Mountain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">No community trips yet</p>
          <p className="text-[10px] text-muted-foreground mt-1">Check back soon for hosted trips!</p>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {trips.map((trip) => (
            <CommunityTripCard
              key={trip.id}
              trip={trip}
              compareMode={compareMode}
              checked={compareIds.includes(trip.id)}
              onToggleCompare={() => toggleCompare(trip.id)}
              onOpen={() => !compareMode && setSelectedTrip(trip)}
            />
          ))}
        </div>
      )}

      <TripDetailDialog
        trip={selectedTrip}
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onBooked={refetch}
      />

      <CompareTripsDialog
        trips={compareTrips}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
    </>
  );
};

const CommunityTripCard: React.FC<{
  trip: CommunityTrip;
  compareMode: boolean;
  checked: boolean;
  onToggleCompare: () => void;
  onOpen: () => void;
}> = ({ trip, compareMode, checked, onToggleCompare, onOpen }) => {
  const seatsLowPct = trip.seats_left / Math.max(trip.seats_total, 1);
  const nights = tripNights(trip);
  const days = tripDays(trip);

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-elegant transition-shadow rounded-2xl border-0 shadow-soft shrink-0 w-64 snap-start relative",
        checked && "ring-2 ring-primary"
      )}
      onClick={() => (compareMode ? onToggleCompare() : onOpen())}
    >
      {compareMode && (
        <div className="absolute top-2 right-2 z-10 bg-background/90 rounded-md p-1">
          <Checkbox checked={checked} onCheckedChange={onToggleCompare} />
        </div>
      )}
      <div className="relative h-32 bg-gradient-hero">
        {trip.cover_url ? (
          <img src={trip.cover_url} alt={trip.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-10 h-10 text-primary-foreground/60" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] gap-1">
          <Sparkles className="w-3 h-3" />
          Hosted
        </Badge>
        {!compareMode && seatsLowPct <= 0.3 && trip.seats_left > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">
            {trip.seats_left} left
          </Badge>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-xs leading-tight line-clamp-2 flex-1">{trip.title}</h3>
          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-medium">{trip.host?.rating?.toFixed(1) ?? "New"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Moon className="w-3 h-3" />{nights}N
            <Sun className="w-3 h-3 ml-0.5" />{days}D
          </span>
          {(trip.recurrence_type === "weekly" || trip.recurrence_type === "custom") && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Repeat className="w-3 h-3" /> {scheduleLabel(trip)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center text-primary font-bold text-sm">
            <IndianRupee className="w-3.5 h-3.5" />
            {trip.price_inr.toLocaleString()}
            <span className="text-[9px] text-muted-foreground font-normal ml-1">/seat</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TripDetailDialog: React.FC<{
  trip: CommunityTrip | null;
  open: boolean;
  onClose: () => void;
  onBooked?: () => void;
}> = ({ trip, open, onClose, onBooked }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  if (!trip) return null;
  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];
  const nights = tripNights(trip);
  const days = tripDays(trip);

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

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Card className="p-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              <div>
                <p className="font-medium">{nights}N / {days}D</p>
                <p className="text-[10px] text-muted-foreground">{scheduleLabel(trip)}</p>
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

          {(trip.pickup_location || trip.dropoff_location) && (
            <div className="grid grid-cols-2 gap-2">
              {trip.pickup_location && (
                <div>
                  <p className="text-xs font-semibold mb-0.5 text-emerald-600">Pickup</p>
                  <p className="text-[11px] text-muted-foreground">{trip.pickup_location}</p>
                </div>
              )}
              {trip.dropoff_location && (
                <div>
                  <p className="text-xs font-semibold mb-0.5 text-rose-600">Drop-off</p>
                  <p className="text-[11px] text-muted-foreground">{trip.dropoff_location}</p>
                </div>
              )}
            </div>
          )}

          {itinerary.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Itinerary
              </p>
              <div className="space-y-2">
                {itinerary.map((d: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-3 py-0.5">
                    <p className="text-xs font-medium">Day {d.day || i + 1}: {d.title || d.plan}</p>
                    {d.description && (
                      <p className="text-[11px] text-muted-foreground">{d.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className={cn("sticky bottom-0 bg-background pt-2 -mx-4 px-4 pb-1 flex items-center justify-between gap-3 border-t")}>
            <div>
              <p className="text-[10px] text-muted-foreground">Total / seat</p>
              <p className="text-base font-bold flex items-center text-primary">
                <IndianRupee className="w-4 h-4" />{trip.price_inr.toLocaleString()}
              </p>
            </div>
            <Button onClick={() => setBookingOpen(true)} className="flex-1" disabled={trip.seats_left === 0}>
              {trip.seats_left === 0 ? "Sold out" : "Book a seat"}
            </Button>
          </div>
        </div>
      </DialogContent>
      <BookingFlowDialog
        trip={trip}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onBooked={() => { onBooked?.(); onClose(); }}
      />
    </Dialog>
  );
};

const CompareTripsDialog: React.FC<{
  trips: CommunityTrip[];
  open: boolean;
  onClose: () => void;
}> = ({ trips, open, onClose }) => {
  if (!trips.length) return null;
  const rows: { label: string; render: (t: CommunityTrip) => React.ReactNode }[] = [
    { label: "Destination", render: t => t.destination },
    { label: "Duration", render: t => `${tripNights(t)}N / ${tripDays(t)}D` },
    { label: "Schedule", render: t => scheduleLabel(t) },
    { label: "Price", render: t => `₹${t.price_inr.toLocaleString()}` },
    { label: "Seats left", render: t => `${t.seats_left}/${t.seats_total}` },
    { label: "Group", render: t => t.group_type },
    { label: "Type", render: t => t.trip_type },
    { label: "Pickup", render: t => t.pickup_location || "—" },
    { label: "Drop-off", render: t => t.dropoff_location || "—" },
    { label: "Rating", render: t => t.host?.rating ? `${t.host.rating.toFixed(1)}★` : "New" },
    { label: "Host", render: t => t.host?.business_name || t.host?.legal_name || "—" },
    { label: "Inclusions", render: t => t.inclusions?.join(", ") || "—" },
  ];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Compare trips
          </DialogTitle>
          <DialogDescription>Side-by-side details</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-muted-foreground sticky left-0 bg-background">Feature</th>
                {trips.map(t => (
                  <th key={t.id} className="text-left p-2 font-semibold min-w-[140px]">{t.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 font-medium text-muted-foreground sticky left-0 bg-background">{r.label}</td>
                  {trips.map(t => (
                    <td key={t.id} className="p-2 align-top">{r.render(t)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityTripsStrip;
