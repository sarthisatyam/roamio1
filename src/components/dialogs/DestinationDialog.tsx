import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Plus, CloudSun, BookOpen, CheckCircle, XCircle, Lightbulb, Sparkles, Users, MapPin, IndianRupee, Mountain } from "lucide-react";
import { toast } from "sonner";
import { useWeather } from "@/hooks/useWeather";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Opening hours for popular attractions
// const attractionHours: Record<string, string> = {
//   "jagannath temple": "5:30 AM – 10 PM",
//   "lingaraj temple": "6 AM – 9 PM",
//   "puri beach": "Open 24 hours",
//   "konark sun temple": "6 AM – 8 PM",
//   "dhauli shanti stupa": "8 AM – 6 PM",
//   "nandankanan zoo": "8 AM – 5 PM",
//   "udayagiri caves": "9 AM – 5 PM",
//   "khandagiri caves": "9 AM – 5 PM",
//   "rajarani temple": "9 AM – 5 PM",
//   "mukteswara temple": "6 AM – 6 PM",
//   "chilika lake": "6 AM – 6 PM",
//   "ekamra kanan": "6 AM – 8 PM",
//   "state museum": "10 AM – 5 PM",
//   "tribal museum": "10 AM – 5 PM",
//   patnagarh: "Open 24 hours",
//   default: "9 AM – 6 PM",
// };

// const getAttractionHours = (activity: string): string => {
//   const lowerActivity = activity.toLowerCase();
//   for (const [key, hours] of Object.entries(attractionHours)) {
//     if (lowerActivity.includes(key)) {
//       return hours;
//     }
//   }
//   return attractionHours.default;
// };

interface Itinerary {
  day: number;
  title: string;
  activities: { time: string; activity: string; type: string }[];
}

interface Eatery {
  name: string;
  type: string;
  rating: number;
  priceRange: string;
  specialty: string;
}

interface TravelTip {
  tip: string;
  category: 'general' | 'do' | 'dont';
}

interface Destination {
  id: number;
  name: string;
  image: string;
  rating: number;
  price: string;
  safety: number;
  tags: string[];
  itinerary?: Itinerary[];
  eateries?: Eatery[];
  travelGuide?: TravelTip[];
}

interface DestinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: Destination | null;
  onAddToPlanner?: (activity: { title: string; location: string; type: string }) => void;
}

const DestinationDialog: React.FC<DestinationDialogProps> = ({ open, onOpenChange, destination, onAddToPlanner }) => {
  const { weather, loading: weatherLoading } = useWeather(destination?.name || null, open);

  if (!destination) return null;

  const handleAddToPlanner = (activity: { time: string; activity: string; type: string }, day: number) => {
    onAddToPlanner?.({
      title: activity.activity,
      location: destination.name,
      type: activity.type,
    });
    toast.success(`"${activity.activity}" added to your planner!`);
  };

  const handleAddEateryToPlanner = (eatery: Eatery) => {
    onAddToPlanner?.({
      title: `Dine at ${eatery.name}`,
      location: destination.name,
      type: "Food",
    });
    toast.success(`"${eatery.name}" added to your planner!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{destination.image}</span>
            <div>
              <h2 className="text-xl font-bold">{destination.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span className="text-sm">{destination.rating}</span>
                </div>
                {weatherLoading ? (
                  <span className="text-xs text-muted-foreground ml-2">Loading weather...</span>
                ) : weather ? (
                  <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-300 ml-1">
                    <CloudSun className="w-3 h-3 mr-1" />
                    <span className="font-normal">{weather}</span>
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground/70 ml-2">Weather unavailable</span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {destination.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Itinerary */}
          {destination.itinerary && destination.itinerary.length > 0 && (() => {
            // Flatten all activities across all days
            const allActivities = destination.itinerary.flatMap((day) =>
              day.activities.map((a) => ({ ...a, day: day.day }))
            );

            const timeSlots = [
              { label: "Morning", icon: "🌅", range: [5, 12] },
              { label: "Daytime", icon: "☀️", range: [12, 17] },
              { label: "Evening", icon: "🌇", range: [17, 21] },
              { label: "Night", icon: "🌙", range: [21, 29] },
            ];

            const parseHour = (time: string): number => {
              const match = time.match(/(\d{1,2}):?\d{0,2}\s*(AM|PM)?/i);
              if (!match) return 12;
              let hour = parseInt(match[1]);
              const period = match[2]?.toUpperCase();
              if (period === "PM" && hour !== 12) hour += 12;
              if (period === "AM" && hour === 12) hour = 0;
              return hour;
            };

            const grouped = timeSlots
              .map((slot) => ({
                ...slot,
                activities: allActivities.filter((a) => {
                  const h = parseHour(a.time);
                  return h >= slot.range[0] && h < slot.range[1];
                }),
              }))
              .filter((slot) => slot.activities.length > 0);

            return (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Suggested Itinerary
                </h3>
                <Card className="p-3">
                  <div className="space-y-3">
                    {grouped.map((slot) => (
                      <div key={slot.label}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-sm">{slot.icon}</span>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{slot.label}</span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {slot.activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                <span className="text-sm truncate">{activity.activity}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={() => handleAddToPlanner(activity, activity.day)}
                              >
                                <Plus className="w-4 h-4 text-primary" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })()}

          <Separator />

          {/* Trips for this destination */}
          <DestinationTripsStrip destination={destination.name} />

          {/* Travel Guide */}
          {destination.travelGuide && destination.travelGuide.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Travel Guide
                </h3>
                <div className="space-y-2.5">
                  {destination.travelGuide.slice(0, 3).map((item, idx) => {
                    const icon = item.category === 'do'
                      ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      : item.category === 'dont'
                      ? <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      : <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
                    const label = item.category === 'do' ? 'DO' : item.category === 'dont' ? "DON'T" : 'TIP';
                    const labelColor = item.category === 'do'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : item.category === 'dont'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-600';

                    return (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/50">
                        {icon}
                        <div className="flex-1 min-w-0">
                          <Badge className={`text-[9px] px-1.5 py-0 mb-1 ${labelColor}`}>{label}</Badge>
                          <p className="text-sm leading-relaxed">{item.tip}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface DestTrip {
  id: string;
  title: string;
  cover_url: string | null;
  price_inr: number;
  seats_left: number;
  duration_nights: number | null;
  start_date: string;
  end_date: string;
}

interface DestPlan {
  id: string;
  plan_name: string;
  cover_image_url: string | null;
  destination_name: string;
  start_date: string;
  end_date: string;
  max_members: number;
}

const DestinationTripsStrip: React.FC<{ destination: string }> = ({ destination }) => {
  const [communityTrips, setCommunityTrips] = useState<DestTrip[]>([]);
  const [groupPlans, setGroupPlans] = useState<DestPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [ct, gp] = await Promise.all([
        supabase
          .from("community_trips")
          .select("id,title,cover_url,price_inr,seats_left,duration_nights,start_date,end_date")
          .eq("status", "published")
          .ilike("destination", `%${destination}%`)
          .limit(8),
        supabase
          .from("plans")
          .select("id,plan_name,cover_image_url,destination_name,start_date,end_date,max_members")
          .eq("status", "open")
          .ilike("destination_name", `%${destination}%`)
          .gte("start_date", new Date().toISOString().split("T")[0])
          .limit(8),
      ]);
      if (cancelled) return;
      setCommunityTrips((ct.data as any) || []);
      setGroupPlans((gp.data as any) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [destination]);

  if (loading) return null;
  if (!communityTrips.length && !groupPlans.length) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-amber-500" /> Trips to {destination}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {communityTrips.map((t) => (
          <Card key={`c-${t.id}`} className="shrink-0 w-44 overflow-hidden rounded-xl border-0 shadow-soft relative">
            <Badge className="absolute top-1.5 left-1.5 z-10 bg-amber-500 text-white text-[9px] px-1.5 py-0">
              <Sparkles className="w-2.5 h-2.5 mr-0.5" />Community
            </Badge>
            <div className="h-20 bg-gradient-hero">
              {t.cover_url ? (
                <img src={t.cover_url} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-primary-foreground/60" />
                </div>
              )}
            </div>
            <div className="p-2 space-y-1">
              <p className="text-[11px] font-semibold line-clamp-2 leading-tight">{t.title}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {t.duration_nights ? `${t.duration_nights}N` : "Trip"}
                </span>
                <span className="font-bold text-primary flex items-center">
                  <IndianRupee className="w-3 h-3" />{t.price_inr.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
        {groupPlans.map((p) => (
          <Card key={`g-${p.id}`} className="shrink-0 w-44 overflow-hidden rounded-xl border-0 shadow-soft relative">
            <Badge className="absolute top-1.5 left-1.5 z-10 bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
              <Users className="w-2.5 h-2.5 mr-0.5" />Group
            </Badge>
            <div className="h-20 bg-muted">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} alt={p.plan_name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <MapPin className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
            <div className="p-2 space-y-1">
              <p className="text-[11px] font-semibold line-clamp-2 leading-tight">{p.plan_name}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(p.start_date), "MMM dd")}–{format(new Date(p.end_date), "MMM dd")}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DestinationDialog;
