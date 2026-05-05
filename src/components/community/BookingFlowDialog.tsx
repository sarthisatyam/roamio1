import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IndianRupee, Loader2, Minus, Plus, ShieldCheck, User } from "lucide-react";
import type { CommunityTrip } from "@/hooks/useCommunityTrips";

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
}

const blank = (): Traveller => ({ name: "", age: "", gender: "", city: "", preferences: "" });

const PREF_OPTIONS = ["Vegetarian", "Vegan", "Non-veg", "Window seat", "Quiet", "Photography", "Trekking", "Nightlife"];

const BookingFlowDialog: React.FC<Props> = ({ trip, open, onOpenChange, onBooked }) => {
  const [seats, setSeats] = useState(1);
  const [phone, setPhone] = useState("");
  const [travellers, setTravellers] = useState<Traveller[]>([blank()]);
  const [step, setStep] = useState<"details" | "review">("details");
  const [submitting, setSubmitting] = useState(false);

  if (!trip) return null;

  const total = trip.price_inr * seats;
  const maxSeats = Math.min(5, trip.seats_left);

  const setSeatCount = (n: number) => {
    setSeats(n);
    setTravellers((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(blank());
      next.length = n;
      return next;
    });
  };

  const updateTraveller = (i: number, k: keyof Traveller, v: string) =>
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));

  const togglePref = (i: number, pref: string) => {
    setTravellers((prev) => prev.map((t, idx) => {
      if (idx !== i) return t;
      const list = t.preferences ? t.preferences.split(",").map(s => s.trim()).filter(Boolean) : [];
      const has = list.includes(pref);
      const next = has ? list.filter(x => x !== pref) : [...list, pref];
      return { ...t, preferences: next.join(", ") };
    }));
  };

  const valid = useMemo(() => {
    if (!phone.trim()) return false;
    return travellers.every(t => t.name.trim() && t.age.trim() && t.gender && t.city.trim());
  }, [phone, travellers]);

  const submit = async () => {
    if (!valid) { toast.error("Please complete every traveller's details"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("book_community_trip", {
        p_trip_id: trip.id,
        p_seats: seats,
        p_contact_phone: phone,
        p_emergency: {},
        p_travellers: travellers,
      } as any);
      if (error) throw error;
      toast.success("Seats booked! You've been added to the trip chat.");
      onOpenChange(false);
      setSeats(1); setPhone(""); setTravellers([blank()]); setStep("details");
      onBooked?.();
    } catch (e: any) {
      toast.error(e.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book your seats</DialogTitle>
          <DialogDescription className="line-clamp-1">{trip.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label className="text-xs">Primary contact phone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
          </div>

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
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Payments are temporarily off — your seats are reserved instantly.
            </p>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !valid}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFlowDialog;
