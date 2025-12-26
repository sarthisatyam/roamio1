import React, { useState } from "react";
import { Home, Calendar, Users, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import HomePage from "./pages/HomePage";
import BookingsPage from "./pages/BookingsPage";
import CompanionPage from "./pages/CompanionPage";
import JourneyPage from "./pages/JourneyPage";
import AccountPage from "./pages/AccountPage";
import FloatingAIBot from "./FloatingAIBot";

interface MainAppProps {
  userData: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onLogout?: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAccount, setShowAccount] = useState(false);
  const [likedCompanions, setLikedCompanions] = useState<number[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<{ id: number; name: string; image: string }[]>([]);
  const [plannerActivities, setPlannerActivities] = useState<{ title: string; location: string; type: string }[]>([]);
  
  // Location state with localStorage persistence
  const [locationEnabled, setLocationEnabled] = useState(() => {
    const saved = localStorage.getItem('locationEnabled');
    return saved !== null ? JSON.parse(saved) : (userData?.locationEnabled ?? false);
  });
  
  const [currentCity, setCurrentCity] = useState<string | null>(() => {
    return localStorage.getItem('currentCity');
  });

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Request browser geolocation permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setLocationEnabled(true);
            localStorage.setItem('locationEnabled', 'true');
            
            // Reverse geocode to get city name
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown';
              setCurrentCity(city);
              localStorage.setItem('currentCity', city);
            } catch {
              setCurrentCity('Unknown');
            }
          },
          () => {
            // Permission denied or error
            setLocationEnabled(false);
            localStorage.setItem('locationEnabled', 'false');
            setCurrentCity(null);
            localStorage.removeItem('currentCity');
          }
        );
      }
    } else {
      setLocationEnabled(false);
      localStorage.setItem('locationEnabled', 'false');
      setCurrentCity(null);
      localStorage.removeItem('currentCity');
    }
  };

  // Merge userData with local locationEnabled state and currentCity
  const mergedUserData = userData ? { ...userData, locationEnabled, currentCity } : null;

  const handleToggleLike = (companionId: number) => {
    setLikedCompanions(prev => 
      prev.includes(companionId) 
        ? prev.filter(id => id !== companionId)
        : [...prev, companionId]
    );
  };

  const handleToggleBookmark = (place: { id: number; name: string; image: string }) => {
    setBookmarkedPlaces(prev => 
      prev.find(p => p.id === place.id)
        ? prev.filter(p => p.id !== place.id)
        : [...prev, place]
    );
  };

  const handleAddToPlanner = (activity: { title: string; location: string; type: string }) => {
    setPlannerActivities(prev => [...prev, activity]);
  };

  const tabs = [
    { id: 0, name: "Home", icon: Home, component: HomePage },
    { id: 1, name: "Bookings", icon: Calendar, component: BookingsPage },
    { id: 2, name: "Companion", icon: Users, component: CompanionPage },
    { id: 3, name: "Journey", icon: Map, component: JourneyPage },
  ];

  const handleNavigateToAccount = () => {
    setShowAccount(true);
  };

  const handleNavigateBack = () => {
    setShowAccount(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (showAccount) {
    return <AccountPage userData={mergedUserData} onNavigateBack={handleNavigateBack} onLogout={handleLogout} likedCompanions={likedCompanions} bookmarkedPlaces={bookmarkedPlaces} onLocationToggle={handleLocationToggle} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 0 && <HomePage userData={mergedUserData} onNavigateToAccount={handleNavigateToAccount} bookmarkedPlaces={bookmarkedPlaces} onToggleBookmark={handleToggleBookmark} onAddToPlanner={handleAddToPlanner} onLocationToggle={handleLocationToggle} />}
        {activeTab === 1 && <BookingsPage userData={mergedUserData} onNavigateToAccount={handleNavigateToAccount} />}
        {activeTab === 2 && <CompanionPage onNavigateToAccount={handleNavigateToAccount} likedCompanions={likedCompanions} onToggleLike={handleToggleLike} />}
        {activeTab === 3 && <JourneyPage onNavigateToAccount={handleNavigateToAccount} externalActivities={plannerActivities} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border px-2 py-2 shadow-soft">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-white shadow-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating AI Bot */}
      <FloatingAIBot />
    </div>
  );
};

export default MainApp;