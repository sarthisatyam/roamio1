import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Home, Calendar, Users, Map, Compass, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import HomePage from "./pages/HomePage";
import BookingsPage from "./pages/BookingsPage";
import CompanionPage from "./pages/CompanionPage";
import JourneyPage from "./pages/JourneyPage";
import ExplorePage from "./pages/ExplorePage";
import PlanBuilder from "./PlanBuilder";
import AccountPage from "./pages/AccountPage";
import FloatingAIBot from "./FloatingAIBot";
import { HelpLegalDialog } from "./dialogs/LegalContactDialogs";

interface MainAppProps {
  userData: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onLogout?: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAccount, setShowAccount] = useState(false);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [likedCompanions, setLikedCompanions] = useState<number[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<{ id: number; name: string; image: string }[]>([]);
  const [plannerActivities, setPlannerActivities] = useState<{ title: string; location: string; type: string }[]>([]);
  const [helpLegalOpen, setHelpLegalOpen] = useState(false);

  // Fetch current user
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setCurrentUserId(uid);
      if (uid) {
        supabase.from("profiles").select("gender").eq("user_id", uid).maybeSingle().then(({ data: p }) => {
          setUserGender((p as any)?.gender || null);
        });
      }
    });
  }, []);
  
  // Location state with localStorage persistence
  const [locationEnabled, setLocationEnabled] = useState(() => {
    const saved = localStorage.getItem('locationEnabled');
    return saved !== null ? JSON.parse(saved) : (userData?.locationEnabled ?? false);
  });
  
  const [currentCity, setCurrentCity] = useState<string | null>(() => {
    return localStorage.getItem('currentCity');
  });
  
  const [userLat, setUserLat] = useState<number | null>(() => {
    const saved = localStorage.getItem('userLat');
    return saved ? parseFloat(saved) : null;
  });
  const [userLng, setUserLng] = useState<number | null>(() => {
    const saved = localStorage.getItem('userLng');
    return saved ? parseFloat(saved) : null;
  });

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Request browser geolocation permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setLocationEnabled(true);
            localStorage.setItem('locationEnabled', 'true');
            
            const { latitude, longitude } = position.coords;
            setUserLat(latitude);
            setUserLng(longitude);
            localStorage.setItem('userLat', latitude.toString());
            localStorage.setItem('userLng', longitude.toString());
            
            // Reverse geocode to get city name
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || data.address?.county || data.address?.state || 'Unknown';
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
    { id: 0, name: "Home", icon: Home },
    { id: 1, name: "Explore", icon: Compass },
    { id: 2, name: "Bookings", icon: Calendar },
    { id: 3, name: "Companion", icon: Users },
    { id: 4, name: "Journey", icon: Map },
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

  if (showPlanBuilder && currentUserId) {
    return (
      <PlanBuilder
        currentUserId={currentUserId}
        userGender={userGender}
        onComplete={() => { setShowPlanBuilder(false); setActiveTab(1); }}
        onClose={() => setShowPlanBuilder(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 0 && <HomePage userData={mergedUserData} onNavigateToAccount={handleNavigateToAccount} bookmarkedPlaces={bookmarkedPlaces} onToggleBookmark={handleToggleBookmark} onAddToPlanner={handleAddToPlanner} onLocationToggle={handleLocationToggle} />}
        {activeTab === 1 && (
          <div className="h-full relative">
            <ExplorePage onNavigateToAccount={handleNavigateToAccount} onCreatePlan={() => setShowPlanBuilder(true)} />
          </div>
        )}
        {activeTab === 2 && <BookingsPage />}
        {activeTab === 3 && <CompanionPage onNavigateToAccount={handleNavigateToAccount} userCity={currentCity} />}
        {activeTab === 4 && <JourneyPage onNavigateToAccount={handleNavigateToAccount} externalActivities={plannerActivities} />}
      </div>

      {/* Footer Links */}
      <div className="bg-muted/50 border-t border-border px-4 py-2 flex justify-center gap-4">
        <button onClick={() => setHelpLegalOpen(true)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Help & Support</button>
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
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-white shadow-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating AI Bot */}
      <FloatingAIBot currentCity={currentCity} locationEnabled={locationEnabled} latitude={userLat} longitude={userLng} />

      {/* Help & Legal Dialog */}
      <HelpLegalDialog open={helpLegalOpen} onOpenChange={setHelpLegalOpen} />
    </div>
  );
};

export default MainApp;