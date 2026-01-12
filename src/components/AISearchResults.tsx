import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Shield, 
  Bookmark, 
  Star, 
  MapPin, 
  Bed, 
  Building2, 
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AISearchResults as AIResults, AIDestination, AIStay, AIFlight, AITrain } from '@/hooks/useAISearch';

interface AISearchResultsProps {
  results: AIResults | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSelectDestination?: (dest: AIDestination) => void;
  onSelectStay?: (stay: AIStay) => void;
  onBookmarkDestination?: (dest: AIDestination) => void;
  bookmarkedIds?: number[];
  showDestinations?: boolean;
  showStays?: boolean;
  showTravel?: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      <span className="text-xs text-muted-foreground">AI is generating results...</span>
    </div>
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-3">
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'hostel': return Bed;
    case 'hotel': return Home;
    case 'coliving': return Building2;
    default: return Bed;
  }
};

export const AISearchResults: React.FC<AISearchResultsProps> = ({
  results,
  isLoading,
  error,
  searchQuery,
  onSelectDestination,
  onSelectStay,
  onBookmarkDestination,
  bookmarkedIds = [],
  showDestinations = true,
  showStays = true,
  showTravel = true,
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-4 text-center border-destructive/20 bg-destructive/5">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
      </Card>
    );
  }

  if (!results) {
    return null;
  }

  const hasDestinations = results.destinations?.length > 0;
  const hasStays = results.stays?.length > 0;
  const hasFlights = results.flights?.length > 0;
  const hasTrains = results.trains?.length > 0;

  return (
    <div className="space-y-4">
      {/* AI Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-generated for "{searchQuery}"
        </Badge>
      </div>

      {/* Destinations */}
      {showDestinations && hasDestinations && (
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Destinations
          </h3>
          <div className="space-y-2">
            {results.destinations.map((dest) => (
              <Card 
                key={dest.id} 
                className="p-3 shadow-soft hover:shadow-medium transition-all cursor-pointer"
                onClick={() => onSelectDestination?.(dest)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">{dest.image}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{dest.name}</h3>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm text-primary">{dest.price}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {dest.rating}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dest.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Stays */}
      {showStays && hasStays && (
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Bed className="w-4 h-4 text-primary" />
            Stays
          </h3>
          <div className="space-y-2">
            {results.stays.map((stay) => {
              const IconComponent = getCategoryIcon(stay.category);
              return (
                <Card 
                  key={stay.id} 
                  className="p-3 shadow-soft hover:shadow-medium transition-all cursor-pointer"
                  onClick={() => onSelectStay?.(stay)}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{stay.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{stay.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-primary">{stay.price}</p>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            {stay.rating}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stay.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Flights and Trains sections removed as per user request */}
    </div>
  );
};

export default AISearchResults;
