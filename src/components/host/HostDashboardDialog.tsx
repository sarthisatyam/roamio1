import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHostProfile } from "@/hooks/useHostProfile";
import { useHostTrips } from "@/hooks/useHostTrips";
import BecomeHostDialog from "./BecomeHostDialog";
import TripBuilderDialog from "./TripBuilderDialog";
import { Loader2, Plus, Sparkles, Users, IndianRupee, Calendar, Star, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const HostDashboardDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { profile, loading, refetch } = useHostProfile();
  const { trips, loading: tripsLoading, updateTripStatus, refetch: refetchTrips } = useHostTrips(profile?.id ?? null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  const totalRevenue = trips.reduce((s, t) => s + (t.revenue ?? 0), 0);
  const totalBookings = trips.reduce((s, t) => s + (t.bookingsCount ?? 0), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Host Dashboard
            </DialogTitle>
            <DialogDescription>
              {profile ? "Manage your community trips and bookings." : "Apply to become a host and start publishing trips."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !profile ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Become a verified host</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Publish curated trips on Roamio. Reach solo and group travellers actively looking for organised trips.
                </p>
              </div>
              <Button onClick={() => setApplyOpen(true)}>Apply now</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Trips</div>
                  <div className="text-2xl font-bold">{trips.length}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Bookings</div>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Revenue</div>
                  <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                </Card>
              </div>

              {/* Profile card */}
              <Card className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{profile.business_name || profile.legal_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {Number(profile.rating ?? 0).toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {profile.city} • {profile.experience_years}y exp • {profile.commission_pct}% commission
                    </p>
                  </div>
                  <Badge>{profile.status}</Badge>
                </div>
              </Card>

              {/* Trips */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">My trips</h4>
                <Button size="sm" onClick={() => setBuilderOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> New trip
                </Button>
              </div>

              {tripsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : trips.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No trips yet. Click "New trip" to publish your first one.
                </Card>
              ) : (
                <div className="space-y-2">
                  {trips.map((t) => (
                    <Card key={t.id} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium truncate">{t.title}</h5>
                            <Badge variant={t.status === "published" ? "default" : "secondary"} className="text-xs">
                              {t.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.destination} • {format(new Date(t.start_date), "MMM d")} - {format(new Date(t.end_date), "MMM d")}
                          </p>
                          <div className="flex gap-3 mt-1 text-xs">
                            <span>₹{t.price_inr.toLocaleString()}/seat</span>
                            <span>{t.seats_total - t.seats_left}/{t.seats_total} booked</span>
                            <span className="text-success">₹{(t.revenue ?? 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {t.status === "published" ? (
                            <Button size="sm" variant="outline" onClick={async () => {
                              await updateTripStatus(t.id, "closed");
                              toast.success("Trip closed");
                            }}>Close</Button>
                          ) : t.status === "draft" ? (
                            <Button size="sm" onClick={async () => {
                              await updateTripStatus(t.id, "published");
                              toast.success("Trip published");
                            }}>Publish</Button>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BecomeHostDialog open={applyOpen} onOpenChange={setApplyOpen} onSuccess={refetch} />
      <TripBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} hostId={profile?.id ?? null} onCreated={refetchTrips} />
    </>
  );
};

export default HostDashboardDialog;
