import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIDestination {
  id: number;
  name: string;
  image: string;
  rating: number;
  price: string;
  safety: number;
  tags: string[];
  itinerary: {
    day: number;
    title: string;
    activities: { time: string; activity: string; type: string }[];
  }[];
  eateries: {
    name: string;
    type: string;
    rating: number;
    priceRange: string;
    specialty: string;
  }[];
}

export interface AIStay {
  id: number;
  name: string;
  location: string;
  price: string;
  rating: number;
  amenities: string[];
  verified: boolean;
  category: 'hostel' | 'hotel' | 'coliving';
}

export interface AIFlight {
  id: number;
  name: string;
  departure: string;
  arrival: string;
  duration: string;
  price: string;
  features: string[];
  type: string;
}

export interface AITrain {
  id: number;
  name: string;
  departure: string;
  arrival: string;
  duration: string;
  price: string;
  features: string[];
  type: string;
}

export interface AISearchResults {
  destinations: AIDestination[];
  stays: AIStay[];
  flights: AIFlight[];
  trains: AITrain[];
}

interface UseAISearchOptions {
  pageContext: 'home' | 'bookings' | 'journey' | 'companion';
  debounceMs?: number;
}

const cache = new Map<string, AISearchResults>();

export function useAISearch(query: string, options: UseAISearchOptions) {
  const { pageContext, debounceMs = 800 } = options;
  const [results, setResults] = useState<AISearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query || query.length < 2) {
      setResults(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `${query.toLowerCase()}_${pageContext}`;
    if (cache.has(cacheKey)) {
      setResults(cache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('search-generator', {
          body: { query, pageContext }
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        cache.set(cacheKey, data);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('AI Search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate results');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, pageContext, debounceMs]);

  return { results, isLoading, error };
}
