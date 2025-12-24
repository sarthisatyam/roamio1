import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Shield, 
  MapPin, 
  Clock, 
  Utensils, 
  Calendar,
  Plus,
  Camera,
  Mountain,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}

interface DestinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: Destination | null;
  onAddToPlanner?: (activity: { title: string; location: string; type: string }) => void;
}

const DestinationDialog: React.FC<DestinationDialogProps> = ({
  open,
  onOpenChange,
  destination,
  onAddToPlanner
}) => {
  if (!destination) return null;

  const handleAddToPlanner = (activity: { time: string; activity: string; type: string }, day: number) => {
    onAddToPlanner?.({
      title: activity.activity,
      location: destination.name,
      type: activity.type
    });
    toast.success(`"${activity.activity}" added to your planner!`);
  };

  const handleAddEateryToPlanner = (eatery: Eatery) => {
    onAddToPlanner?.({
      title: `Dine at ${eatery.name}`,
      location: destination.name,
      type: "Food"
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
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                  <Shield className="w-3 h-3 mr-1" />
                  {destination.safety}% Safe
                </Badge>
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
          {destination.itinerary && destination.itinerary.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Suggested Itinerary
              </h3>
              <div className="space-y-4">
                {destination.itinerary.map((day) => (
                  <Card key={day.day} className="p-3">
                    <h4 className="font-medium text-sm mb-2 text-primary">Day {day.day}: {day.title}</h4>
                    <div className="space-y-2">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                            <span className="text-sm truncate">{activity.activity}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                            onClick={() => handleAddToPlanner(activity, day.day)}
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Eateries */}
          {destination.eateries && destination.eateries.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary" />
                Popular Eateries
              </h3>
              <div className="space-y-3">
                {destination.eateries.map((eatery, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{eatery.name}</h4>
                          <Badge variant="outline" className="text-[10px]">{eatery.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>{eatery.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{eatery.priceRange}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Known for: {eatery.specialty}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleAddEateryToPlanner(eatery)}
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DestinationDialog;
