import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Calendar, Users, Star, ShieldCheck,
  IndianRupee, Clock, Loader2, Sparkles, Mountain,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useCommunityTrips, CommunityTrip } from "@/hooks/useCommunityTrips";
import { cn } from "@/lib/utils";
import BookingFlowDialog from "./BookingFlowDialog";

const CommunityTripsStrip: React.FC = () => {
  const { trips, loading, refetch } = useCommunityTrips();
  const [selectedTrip, setSelectedTrip] = useState<CommunityTrip | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="p-6 text-center rounded-2xl border-0 shadow-soft">
        <Mountain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No community trips yet</p>
        <p className="text-[10px] text-muted-foreground mt-1">Check back soon for hosted trips!</p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {trips.map((trip) => (
          <CommunityTripCard
            key={trip.id}
            trip={trip}
            onOpen={() => setSelectedTrip(trip)}
          />
        ))}
      </div>

      <TripDetailDialog
        trip={selectedTrip}
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onBooked={refetch}
      />
    </>
  );
};

const CommunityTripCard: React.FC<{ trip: CommunityTrip; onOpen: () => void }> = ({ trip, onOpen }) => {
  const days = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const seatsLowPct = trip.seats_left / Math.max(trip.seats_total, 1);

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-elegant transition-shadow rounded-2xl border-0 shadow-soft shrink-0 w-64 snap-start"
      onClick={onOpen}
    >
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
        {seatsLowPct <= 0.3 && trip.seats_left > 0 && (
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
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(trip.start_date), "d MMM")} • {days}D</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trip.seats_left}/{trip.seats_total}</span>
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
  const days = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];

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

export default CommunityTripsStrip;
