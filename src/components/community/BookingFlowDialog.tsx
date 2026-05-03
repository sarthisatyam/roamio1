import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IndianRupee, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import type { CommunityTrip } from "@/hooks/useCommunityTrips";

interface Props {
  trip: CommunityTrip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onBooked?: () => void;
}

const BookingFlowDialog: React.FC<Props> = ({ trip, open, onOpenChange, onBooked }) => {
  const [seats, setSeats] = useState(1);
  const [phone, setPhone] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!trip) return null;

  const total = trip.price_inr * seats;
  const maxSeats = Math.min(5, trip.seats_left);

  const submit = async () => {
    if (!phone.trim() || !emName.trim() || !emPhone.trim()) {
      toast.error("Please fill contact and emergency contact details");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("book_community_trip", {
        p_trip_id: trip.id,
        p_seats: seats,
        p_contact_phone: phone,
        p_emergency: { name: emName, phone: emPhone },
      });
      if (error) throw error;
      toast.success("Seat booked! You've been added to the trip chat.");
      onOpenChange(false);
      setSeats(1); setPhone(""); setEmName(""); setEmPhone("");
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
          <DialogTitle>Book your seat</DialogTitle>
          <DialogDescription className="line-clamp-1">{trip.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">Seats</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8"
                disabled={seats <= 1}
                onClick={() => setSeats((s) => s - 1)}><Minus className="w-3 h-3" /></Button>
              <span className="w-6 text-center font-semibold">{seats}</span>
              <Button size="icon" variant="outline" className="h-8 w-8"
                disabled={seats >= maxSeats}
                onClick={() => setSeats((s) => s + 1)}><Plus className="w-3 h-3" /></Button>
            </div>
          </Card>

          <div className="space-y-2">
            <Label className="text-xs">Your phone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Emergency name *</Label>
              <Input value={emName} onChange={(e) => setEmName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Emergency phone *</Label>
              <Input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} />
            </div>
          </div>

          <Card className="p-3 bg-muted/40">
            <div className="flex items-center justify-between text-sm">
              <span>Total</span>
              <span className="font-bold flex items-center text-primary text-lg">
                <IndianRupee className="w-4 h-4" />{total.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Payments are temporarily off — your seat is reserved instantly.
            </p>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFlowDialog;
