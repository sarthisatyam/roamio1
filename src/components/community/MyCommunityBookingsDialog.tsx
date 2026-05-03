import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyBookings } from "@/hooks/useMyBookings";
import { Loader2, Mountain, Calendar, MapPin, IndianRupee, Users } from "lucide-react";
import { format } from "date-fns";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

const MyCommunityBookingsDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { bookings, loading } = useMyBookings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mountain className="w-5 h-5 text-primary" /> My Community Trips</DialogTitle>
          <DialogDescription>Seats you've booked on hosted trips.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No bookings yet. Browse community trips in the Companion → Trips tab.
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id} className="overflow-hidden">
                {b.trip?.cover_url && (
                  <div className="h-28 bg-gradient-hero">
                    <img src={b.trip.cover_url} alt={b.trip.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">{b.trip?.title}</h4>
                    <Badge variant={b.status === "paid" ? "default" : "secondary"} className="text-[10px] capitalize">{b.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.trip?.destination}</span>
                    {b.trip?.start_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(b.trip.start_date), "d MMM")}</span>
                    )}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.seats} seat{b.seats > 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1 text-primary font-medium"><IndianRupee className="w-3 h-3" />{b.amount_paid.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyCommunityBookingsDialog;
