import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHostTrips, HostTripInput } from "@/hooks/useHostTrips";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  hostId: string | null;
  onCreated?: () => void;
}

const GROUP_TYPES = ["co-ed", "women-only", "male-only"];
const TRIP_TYPES = ["trek", "road trip", "leisure", "adventure", "cultural", "spiritual"];

const TripBuilderDialog: React.FC<Props> = ({ open, onOpenChange, hostId, onCreated }) => {
  const { createTrip } = useHostTrips(hostId);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<HostTripInput>({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    price_inr: 0,
    seats_total: 8,
    group_type: "co-ed",
    trip_type: "leisure",
    meeting_point: "",
    cancellation_policy: "",
    cover_url: "",
    inclusions: [],
    exclusions: [],
    itinerary: [],
    recurrence_type: "one_time",
    recurrence_days: [],
    recurrence_dates: [],
    duration_nights: 1,
    pickup_location: "",
    dropoff_location: "",
  });
  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [customDateInput, setCustomDateInput] = useState("");

  const DOW = [
    { v: 0, l: "Sun" }, { v: 1, l: "Mon" }, { v: 2, l: "Tue" }, { v: 3, l: "Wed" },
    { v: 4, l: "Thu" }, { v: 5, l: "Fri" }, { v: 6, l: "Sat" },
  ];

  const toggleDow = (d: number) => {
    const cur = form.recurrence_days ?? [];
    u("recurrence_days", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  };
  const addCustomDate = () => {
    if (!customDateInput) return;
    u("recurrence_dates", [...(form.recurrence_dates ?? []), customDateInput]);
    setCustomDateInput("");
  };

  const u = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addItem = (key: "inclusions" | "exclusions", val: string, clear: () => void) => {
    if (!val.trim()) return;
    u(key, [...(form[key] ?? []), val.trim()]);
    clear();
  };

  const addDay = () => {
    if (!dayInput.trim()) return;
    u("itinerary", [...(form.itinerary ?? []), { day: (form.itinerary?.length ?? 0) + 1, plan: dayInput.trim() }]);
    setDayInput("");
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!form.title || !form.destination || !form.start_date || !form.end_date || !form.price_inr) {
      toast.error("Fill title, destination, dates, and price");
      return;
    }
    setSubmitting(true);
    try {
      await createTrip({ ...form, status });
      toast.success(status === "published" ? "Trip published!" : "Saved as draft");
      onOpenChange(false);
      onCreated?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a community trip</DialogTitle>
          <DialogDescription>
            List your trip and start accepting bookings.
            <span className="block mt-1 text-[11px] text-amber-600">
              Tip: For the same destination, dates must not overlap. Same itinerary → same price; different itinerary → different price.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Trip title *</Label>
            <Input value={form.title} onChange={(e) => u("title", e.target.value)} placeholder="e.g. Spiti Valley Roadtrip" />
          </div>
          <div>
            <Label>Destination *</Label>
            <Input value={form.destination} onChange={(e) => u("destination", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start date *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div>
              <Label>End date *</Label>
              <Input type="date" value={form.end_date} onChange={(e) => u("end_date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price per seat (INR) *</Label>
              <Input type="number" min={0} value={form.price_inr} onChange={(e) => u("price_inr", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Total seats *</Label>
              <Input type="number" min={1} value={form.seats_total} onChange={(e) => u("seats_total", parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Group type</Label>
              <Select value={form.group_type} onValueChange={(v) => u("group_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GROUP_TYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trip type</Label>
              <Select value={form.trip_type} onValueChange={(v) => u("trip_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIP_TYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Cover image URL</Label>
            <Input value={form.cover_url} onChange={(e) => u("cover_url", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Meeting point</Label>
            <Input value={form.meeting_point} onChange={(e) => u("meeting_point", e.target.value)} />
          </div>
          <div>
            <Label>Cancellation policy</Label>
            <Textarea rows={2} value={form.cancellation_policy} onChange={(e) => u("cancellation_policy", e.target.value)} />
          </div>

          <div>
            <Label>Itinerary (day-by-day)</Label>
            <div className="flex gap-2">
              <Input value={dayInput} onChange={(e) => setDayInput(e.target.value)} placeholder="Day plan…" />
              <Button type="button" size="icon" variant="outline" onClick={addDay}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="mt-2 space-y-1">
              {(form.itinerary ?? []).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2 text-sm">
                  <span><b>Day {d.day}:</b> {d.plan}</span>
                  <Button size="icon" variant="ghost" onClick={() => u("itinerary", form.itinerary!.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Inclusions</Label>
              <div className="flex gap-2">
                <Input value={inclusionInput} onChange={(e) => setInclusionInput(e.target.value)} placeholder="Stay, food..." />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem("inclusions", inclusionInput, () => setInclusionInput(""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(form.inclusions ?? []).map((x, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer"
                    onClick={() => u("inclusions", form.inclusions!.filter((_, idx) => idx !== i))}>
                    {x} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Exclusions</Label>
              <div className="flex gap-2">
                <Input value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)} placeholder="Flights..." />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem("exclusions", exclusionInput, () => setExclusionInput(""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(form.exclusions ?? []).map((x, i) => (
                  <Badge key={i} variant="outline" className="cursor-pointer"
                    onClick={() => u("exclusions", form.exclusions!.filter((_, idx) => idx !== i))}>
                    {x} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={submitting}>Save draft</Button>
          <Button onClick={() => handleSubmit("published")} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TripBuilderDialog;
