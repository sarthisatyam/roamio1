import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, IndianRupee, Loader2, Minus, Plus, Phone, ShieldCheck, User, Calendar as CalendarIcon } from "lucide-react";
import type { CommunityTrip } from "@/hooks/useCommunityTrips";
import { addDays, format } from "date-fns";

interface Props {
  trip: CommunityTrip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onBooked?: () => void;
}

interface Traveller {
  name: string;
  age: string;
  gender: string;
  city: string;
  preferences: string;
  phone: string;
}

const blank = (): Traveller => ({ name: "", age: "", gender: "", city: "", preferences: "", phone: "" });
const PREF_OPTIONS = ["Vegetarian", "Vegan", "Non-veg", "Window seat", "Quiet", "Photography", "Trekking", "Nightlife"];

type Step = "details" | "payment" | "phones" | "done";

// Compute next departures for a recurring trip
const upcomingDepartures = (trip: CommunityTrip): string[] => {
  if (trip.recurrence_type === "custom" && trip.recurrence_dates?.length) {
    return [...trip.recurrence_dates].sort();
  }
  if (trip.recurrence_type === "weekly" && trip.recurrence_days?.length) {
    const out: string[] = [];
    const seriesEnd = trip.end_date ? new Date(trip.end_date) : addDays(new Date(), 90);
    let d = new Date();
    let limit = 12;
    while (d <= seriesEnd && out.length < limit) {
      if (trip.recurrence_days.includes(d.getDay())) out.push(format(d, "yyyy-MM-dd"));
      d = addDays(d, 1);
    }
    return out;
  }
  return [trip.start_date];
};

const BookingFlowDialog: React.FC<Props> = ({ trip, open, onOpenChange, onBooked }) => {
  const [step, setStep] = useState<Step>("details");
  const [seats, setSeats] = useState(1);
  const [travellers, setTravellers] = useState<Traveller[]>([blank()]);
  const [departureDate, setDepartureDate] = useState<string>("");
  // Billing / general
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  if (!trip) return null;

  const departures = useMemo(() => upcomingDepartures(trip), [trip]);
  const isRecurring = trip.recurrence_type === "weekly" || trip.recurrence_type === "custom";
  const total = trip.price_inr * seats;
  const maxSeats = Math.min(8, trip.seats_left);

  const setSeatCount = (n: number) => {
    setSeats(n);
    setTravellers(prev => {
      const next = [...prev];
      while (next.length < n) next.push(blank());
      next.length = n;
      return next;
    });
  };

  const updateTraveller = (i: number, k: keyof Traveller, v: string) =>
    setTravellers(prev => prev.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));

  const togglePref = (i: number, pref: string) => {
    setTravellers(prev => prev.map((t, idx) => {
      if (idx !== i) return t;
      const list = t.preferences ? t.preferences.split(",").map(s => s.trim()).filter(Boolean) : [];
      const has = list.includes(pref);
      const next = has ? list.filter(x => x !== pref) : [...list, pref];
      return { ...t, preferences: next.join(", ") };
    }));
  };

  const detailsValid = useMemo(() => {
    if (!billingName.trim() || !billingEmail.trim() || !billingPhone.trim()) return false;
    if (isRecurring && !departureDate) return false;
    return travellers.every(t => t.name.trim() && t.age.trim() && t.gender && t.city.trim());
  }, [billingName, billingEmail, billingPhone, departureDate, isRecurring, travellers]);

  const phonesValid = travellers.every(t => t.phone.trim().length >= 7);

  const reset = () => {
    setStep("details"); setSeats(1); setTravellers([blank()]);
    setDepartureDate(""); setBillingName(""); setBillingEmail("");
    setBillingPhone(""); setBillingAddress(""); setBookingId(null);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const submitBooking = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("book_community_trip", {
        p_trip_id: trip.id,
        p_seats: seats,
        p_contact_phone: billingPhone,
        p_emergency: {},
        p_travellers: travellers.map(({ phone, ...rest }) => rest),
        p_billing: { name: billingName, email: billingEmail, phone: billingPhone, address: billingAddress },
        p_departure_date: isRecurring ? departureDate : trip.start_date,
      } as any);
      if (error) throw error;
      setBookingId(data as any);
      setStep("phones");
    } catch (e: any) {
      toast.error(e.message || "Booking failed");
      setStep("details");
    } finally {
      setSubmitting(false);
    }
  };

  const savePhones = async () => {
    if (!bookingId) return;
    if (!phonesValid) { toast.error("Add a phone for every traveller"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("community_bookings")
        .update({ travellers: travellers as any })
        .eq("id", bookingId);
      if (error) throw error;
      toast.success("All set! Travellers added to the trip chat.");
      setStep("done");
      onBooked?.();
    } catch (e: any) {
      toast.error(e.message || "Could not save phones");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "details" && "Trip & billing details"}
            {step === "payment" && "Payment"}
            {step === "phones" && "Add traveller phones"}
            {step === "done" && "You're booked! 🎉"}
          </DialogTitle>
          <DialogDescription className="line-clamp-1">{trip.title}</DialogDescription>
        </DialogHeader>

        {/* STEP 1 */}
        {step === "details" && (
          <div className="space-y-4">
            {isRecurring && (
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Choose departure date *
                </Label>
                <Select value={departureDate} onValueChange={setDepartureDate}>
                  <SelectTrigger><SelectValue placeholder="Pick a departure" /></SelectTrigger>
                  <SelectContent>
                    {departures.map(d => (
                      <SelectItem key={d} value={d}>{format(new Date(d), "EEE, d MMM yyyy")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">Seats</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8"
                  disabled={seats <= 1}
                  onClick={() => setSeatCount(seats - 1)}><Minus className="w-3 h-3" /></Button>
                <span className="w-6 text-center font-semibold">{seats}</span>
                <Button size="icon" variant="outline" className="h-8 w-8"
                  disabled={seats >= maxSeats}
                  onClick={() => setSeatCount(seats + 1)}><Plus className="w-3 h-3" /></Button>
              </div>
            </Card>

            <Card className="p-3 space-y-2">
              <p className="text-xs font-semibold">Billing details</p>
              <Input placeholder="Full name *" value={billingName} onChange={e => setBillingName(e.target.value)} />
              <Input placeholder="Email *" type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} />
              <Input placeholder="Phone *" value={billingPhone} onChange={e => setBillingPhone(e.target.value)} />
              <Input placeholder="Billing address" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
            </Card>

            {travellers.map((t, i) => (
              <Card key={i} className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Traveller {i + 1}{i === 0 ? " (you)" : ""}</span>
                </div>
                <Input placeholder="Full name *" value={t.name} onChange={(e) => updateTraveller(i, "name", e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Age *" type="number" value={t.age} onChange={(e) => updateTraveller(i, "age", e.target.value)} />
                  <Select value={t.gender} onValueChange={(v) => updateTraveller(i, "gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Gender *" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Current city *" value={t.city} onChange={(e) => updateTraveller(i, "city", e.target.value)} />
                <div>
                  <Label className="text-[10px] text-muted-foreground">Preferences</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PREF_OPTIONS.map(p => {
                      const active = t.preferences.split(",").map(s => s.trim()).includes(p);
                      return (
                        <Badge key={p} variant={active ? "default" : "outline"}
                          className="cursor-pointer text-[10px]"
                          onClick={() => togglePref(i, p)}>{p}</Badge>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-3 bg-muted/40">
              <div className="flex items-center justify-between text-sm">
                <span>Total ({seats} seat{seats > 1 ? "s" : ""})</span>
                <span className="font-bold flex items-center text-primary text-lg">
                  <IndianRupee className="w-4 h-4" />{total.toLocaleString()}
                </span>
              </div>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button disabled={!detailsValid} onClick={() => setStep("payment")}>
                Continue to payment
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 2 - mock payment */}
        {step === "payment" && (
          <div className="space-y-4">
            <Card className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Pay to confirm</p>
              <p className="text-2xl font-bold flex items-center text-primary">
                <IndianRupee className="w-5 h-5" />{total.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure checkout — payments are temporarily simulated.
              </p>
            </Card>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("details")}>Back</Button>
              <Button onClick={submitBooking} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Pay ₹{total.toLocaleString()}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3 - collect phones */}
        {step === "phones" && (
          <div className="space-y-3">
            <Card className="p-3 bg-emerald-50 border-emerald-200">
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payment received — booking confirmed.
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Add a phone for each traveller so the host can reach everyone on departure day.
              </p>
            </Card>
            {travellers.map((t, i) => (
              <Card key={i} className="p-3 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" /> {t.name || `Traveller ${i + 1}`}
                </p>
                <Input placeholder="Phone number *" value={t.phone}
                  onChange={(e) => updateTraveller(i, "phone", e.target.value)} />
              </Card>
            ))}
            <DialogFooter>
              <Button onClick={savePhones} disabled={submitting || !phonesValid} className="w-full">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save & finish
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500" />
            <p className="text-sm">Your seats are confirmed. Find this trip in <b>My Trips</b>.</p>
            <Button onClick={() => handleClose(false)} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingFlowDialog;
