import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, User as UserIcon, IndianRupee } from "lucide-react";

interface BookingRow {
  id: string;
  user_id: string;
  seats: number;
  amount_paid: number;
  status: string;
  contact_phone: string | null;
  emergency_contact: any;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tripId: string | null;
  tripTitle?: string;
}

const TripRosterDialog: React.FC<Props> = ({ open, onOpenChange, tripId, tripTitle }) => {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !tripId) return;
    (async () => {
      setLoading(true);
      const { data: bookings } = await supabase
        .from("community_bookings")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });
      const list = (bookings ?? []) as any[];
      const ids = [...new Set(list.map((b) => b.user_id))];
      let map = new Map<string, any>();
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", ids);
        (profiles ?? []).forEach((p: any) => map.set(p.user_id, p));
      }
      setRows(list.map((b) => ({ ...b, profile: map.get(b.user_id) })));
      setLoading(false);
    })();
  }, [open, tripId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trip roster</DialogTitle>
          <DialogDescription className="line-clamp-1">{tripTitle}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No bookings yet.</Card>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card key={r.id} className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.profile?.display_name || "Traveller"}</p>
                      <p className="text-[10px] text-muted-foreground">{r.seats} seat{r.seats > 1 ? "s" : ""} • {r.status}</p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold flex items-center text-primary">
                    <IndianRupee className="w-3 h-3" />{r.amount_paid.toLocaleString()}
                  </div>
                </div>
                {r.contact_phone && (
                  <p className="text-[11px] flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-3 h-3" /> {r.contact_phone}
                  </p>
                )}
                {r.emergency_contact?.name && (
                  <p className="text-[11px] text-muted-foreground">
                    Emergency: {r.emergency_contact.name} ({r.emergency_contact.phone})
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripRosterDialog;
