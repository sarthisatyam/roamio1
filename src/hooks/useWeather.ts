import { useState, useEffect } from "react";

// Cache for weather data
const weatherCache: Record<string, { data: string; timestamp: number }> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useWeather = (cityName: string | null, enabled: boolean = true) => {
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cityName || !enabled) {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      const normalizedCity = cityName.toLowerCase().split(',')[0].trim();
      
      // Check cache first
      const cached = weatherCache[normalizedCity];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setWeather(cached.data);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(normalizedCity)}?format=%C+%t`);
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.text();
        
        // Cache the result
        weatherCache[normalizedCity] = { data, timestamp: Date.now() };
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [cityName, enabled]);

  return { weather, loading };
};

// For batch fetching multiple cities at once
export const useMultipleWeather = (cities: string[]) => {
  const [weatherMap, setWeatherMap] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cities.length === 0) return;

    const fetchAllWeather = async () => {
      setLoading(true);
      const results: Record<string, string | null> = {};

      await Promise.all(
        cities.map(async (city) => {
          const normalizedCity = city.toLowerCase().split(',')[0].trim();
          
          // Check cache first
          const cached = weatherCache[normalizedCity];
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            results[city] = cached.data;
            return;
          }

          try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(normalizedCity)}?format=%C+%t`);
            if (!response.ok) throw new Error('Weather fetch failed');
            const data = await response.text();
            
            // Cache the result
            weatherCache[normalizedCity] = { data, timestamp: Date.now() };
            results[city] = data;
          } catch (error) {
            console.error(`Failed to fetch weather for ${city}:`, error);
            results[city] = null;
          }
        })
      );

      setWeatherMap(results);
      setLoading(false);
    };

    fetchAllWeather();
  }, [cities.join(',')]);

  return { weatherMap, loading };
};
