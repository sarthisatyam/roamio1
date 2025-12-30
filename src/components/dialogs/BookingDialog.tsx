import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingDown, Star, Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingPlatform {
  name: string;
  price: string;
  savings?: string;
  url: string;
  icon?: string;
  logo?: string;
}

// Platform logos
const PLATFORM_LOGOS: Record<string, string> = {
  makemytrip: "https://imgak.mmtcdn.com/pwa_v3/pwa_header_assets/logo.png",
  goibibo: "https://gos3.ibcdn.com/goibiboLogoVIP-1540542890.png",
  agoda: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Agoda_transparent_logo.png"
};

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  platforms: BookingPlatform[];
  eventDetails?: {
    date?: string;
    time?: string;
    duration?: string;
    location?: string;
    rating?: number;
    reviews?: string;
  };
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  platforms,
  eventDetails
}) => {
  const getBestPlatform = () => {
    let minPrice = Infinity;
    let bestIndex = 0;
    platforms.forEach((platform, index) => {
      const priceNum = parseInt(platform.price.replace(/[₹,]/g, '') || '0');
      if (priceNum < minPrice) {
        minPrice = priceNum;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const bestPlatformIndex = getBestPlatform();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        {eventDetails && (
          <div className="p-3 bg-muted/50 rounded-xl mb-4 space-y-2">
            {eventDetails.date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{eventDetails.date}</span>
              </div>
            )}
            {eventDetails.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{eventDetails.duration}</span>
              </div>
            )}
            {eventDetails.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{eventDetails.location}</span>
              </div>
            )}
            {eventDetails.rating && (
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span>{eventDetails.rating}</span>
                {eventDetails.reviews && (
                  <span className="text-muted-foreground">({eventDetails.reviews} reviews)</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-success" />
            <h4 className="font-semibold text-sm">Compare Prices</h4>
          </div>

        {platforms.slice(0, 3).map((platform, index) => {
            const isBest = index === bestPlatformIndex;
            const platformKey = platform.name.toLowerCase().replace(/\s/g, '');
            const logoUrl = platform.logo || PLATFORM_LOGOS[platformKey];
            
            return (
              <div
                key={platform.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all",
                  isBest ? "bg-success/10 border border-success/30" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={platform.name} 
                      className="h-6 w-auto max-w-[80px] object-contain"
                    />
                  ) : (
                    <span className="text-xl">{platform.icon}</span>
                  )}
                  <div>
                    <p className="font-medium text-sm capitalize">{platform.name}</p>
                    {isBest && (
                      <Badge className="text-[10px] bg-success text-success-foreground mt-0.5">
                        Best Price
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-sm">{platform.price}</p>
                    {platform.savings && platform.savings !== "₹0" && (
                      <p className="text-xs text-success">Save {platform.savings}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isBest ? "default" : "outline"}
                    className={cn(
                      "h-8 rounded-lg",
                      isBest && "bg-gradient-primary text-white border-0"
                    )}
                    onClick={() => window.open(platform.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
