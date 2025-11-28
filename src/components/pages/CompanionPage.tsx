import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Shield,
  Camera,
  Coffee,
  Briefcase,
  Music,
  CheckCircle,
  Heart,
  Plus,
  UserPlus,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanionPageProps {
  onNavigateToAccount?: () => void;
  likedCompanions?: number[];
  onToggleLike?: (companionId: number) => void;
}

const CompanionPage: React.FC<CompanionPageProps> = ({ 
  onNavigateToAccount, 
  likedCompanions = [], 
  onToggleLike 
}) => {
  const [activeTab, setActiveTab] = useState("discover");
  const [filters, setFilters] = useState({
    gender: 'all',
    status: 'all',
    radius: [5],
    ageRange: [18, 65],
    interests: []
  });

  const companions = [
    {
      id: 1,
      name: "Priya Sharma",
      age: 28,
      location: "2.3 km away",
      distance: 2.3,
      bio: "Tech professional exploring Delhi. Love coworking spaces and chai spots ☕",
      interests: ["Coworking", "Chai Spots", "Photography"],
      verified: true,
      gender: "female",
      profileImage: "👩‍💻",
      online: true,
      mutualInterests: 3
    },
    {
      id: 2,
      name: "Ananya Patel", 
      age: 25,
      location: "1.8 km away",
      distance: 1.8,
      bio: "Solo traveler from Mumbai. Always up for temple visits and cultural experiences 🏛️",
      interests: ["Temples", "Heritage", "Local Markets"],
      verified: true,
      gender: "female",
      profileImage: "👩‍🎨",
      online: false,
      mutualInterests: 2
    },
    {
      id: 3,
      name: "Arjun Singh",
      age: 30,
      location: "3.1 km away",
      distance: 3.1, 
      bio: "Adventure enthusiast looking for trekking buddies in the Himalayas 🏔️",
      interests: ["Trekking", "Photography", "Adventure Sports"],
      verified: true,
      gender: "male",
      profileImage: "👨‍🦱",
      online: true,
      mutualInterests: 1
    },
    {
      id: 4,
      name: "Meera Reddy",
      age: 26,
      location: "0.9 km away",
      distance: 0.9,
      bio: "Foodie exploring Indian street food and hidden gems. Let's try some chaat! 🍲",
      interests: ["Street Food", "Local Markets", "Cultural Events"],
      verified: true,
      gender: "female", 
      profileImage: "👩‍🍳",
      online: true,
      mutualInterests: 2
    }
  ];

  const groups = [
    {
      id: 1,
      name: "Delhi Digital Nomads",
      members: 324,
      category: "Coworking",
      description: "Community for remote workers exploring Delhi NCR",
      lastActivity: "2 hours ago",
      joined: true
    },
    {
      id: 2,
      name: "Solo Female Travelers - India",
      members: 189,
      category: "Safety",
      description: "Safe space for women traveling solo across India",
      lastActivity: "1 hour ago", 
      joined: false
    },
    {
      id: 3,
      name: "Street Food Adventures",
      members: 256,
      category: "Food",
      description: "Discover the best Indian street food experiences together",
      lastActivity: "30 minutes ago",
      joined: true
    }
  ];

  const filteredCompanions = companions.filter(companion => {
    // Gender filter
    if (filters.gender !== 'all' && companion.gender !== filters.gender) {
      return false;
    }
    
    // Status filter
    if (filters.status === 'online' && !companion.online) {
      return false;
    }
    
    // Radius filter
    if (companion.distance > filters.radius[0]) {
      return false;
    }
    
    // Age filter
    if (companion.age < filters.ageRange[0] || companion.age > filters.ageRange[1]) {
      return false;
    }
    
    // Interests filter
    if (filters.interests.length > 0) {
      const hasMatchingInterest = filters.interests.some(interest => 
        companion.interests.includes(interest)
      );
      if (!hasMatchingInterest) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero p-4 sm:p-6 pb-6 sm:pb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Find Companions</h1>
            <p className="text-white/80 text-xs sm:text-sm">Connect with verified solo travelers near you</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToAccount}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary/90 text-foreground hover:bg-secondary border-secondary flex-shrink-0"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by interests or Indian cities..."
            className="pl-9 sm:pl-10 text-sm bg-white/95 backdrop-blur border-0 shadow-medium h-9 sm:h-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 sm:mx-6 mt-4">
            <TabsTrigger value="discover" className="text-xs sm:text-sm">Discover</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
            <TabsTrigger value="community" className="text-xs sm:text-sm">Community</TabsTrigger>
          </TabsList>

          {/* Filters - only show on Discover tab */}
          {activeTab === "discover" && (
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 sm:gap-2 flex-wrap overflow-x-auto scrollbar-hide">
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs whitespace-nowrap py-0.5 px-2">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {filters.gender === 'all' ? 'All' : filters.gender === 'female' ? 'Females' : 'Males'}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs whitespace-nowrap py-0.5 px-2">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Within {filters.radius[0]}km
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs whitespace-nowrap py-0.5 px-2">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {filters.status === 'all' ? 'All' : 'Online only'}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs whitespace-nowrap py-0.5 px-2">
                    Ages {filters.ageRange[0]}-{filters.ageRange[1]}
                  </Badge>
                  {filters.interests.length > 0 && (
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs whitespace-nowrap py-0.5 px-2">
                      {filters.interests.length} interests
                    </Badge>
                  )}
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-shrink-0 h-7 sm:h-9 text-xs">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Filters</h4>
                      </div>
                      
                      {/* Gender Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Gender</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['all', 'female', 'male'].map((gender) => (
                            <Button
                              key={gender}
                              variant={filters.gender === gender ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, gender }))}
                              className={cn(
                                "capitalize",
                                filters.gender === gender && "bg-gradient-primary text-white border-0"
                              )}
                            >
                              {gender}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['all', 'online'].map((status) => (
                            <Button
                              key={status}
                              variant={filters.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, status }))}
                              className={cn(
                                "capitalize",
                                filters.status === status && "bg-gradient-primary text-white border-0"
                              )}
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Radius Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Radius: {filters.radius[0]}km
                        </label>
                        <Slider
                          value={filters.radius}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value }))}
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <Separator />
                      
                      {/* Age Range Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Age: {filters.ageRange[0]}-{filters.ageRange[1]} years
                        </label>
                        <Slider
                          value={filters.ageRange}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
                          max={80}
                          min={18}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <Separator />
                      
                      {/* Interests Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {["Coworking", "Chai Spots", "Photography", "Temples", "Heritage", "Local Markets", "Trekking", "Adventure Sports", "Street Food", "Cultural Events"].map((interest) => (
                            <Button
                              key={interest}
                              variant={filters.interests.includes(interest) ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters(prev => ({
                                ...prev,
                                interests: prev.interests.includes(interest)
                                  ? prev.interests.filter(i => i !== interest)
                                  : [...prev.interests, interest]
                              }))}
                              className={cn(
                                "text-xs",
                                filters.interests.includes(interest) && "bg-gradient-primary text-white border-0"
                              )}
                            >
                              {interest}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Reset Filters */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({
                          gender: 'all',
                          status: 'all',
                          radius: [5],
                          ageRange: [18, 65],
                          interests: []
                        })}
                        className="w-full"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Discover Tab */}
          <TabsContent value="discover" className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
          <div className="space-y-3 sm:space-y-4">
            {filteredCompanions.map((companion) => (
              <Card key={companion.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 text-3xl sm:text-4xl flex items-center justify-center">
                      {companion.profileImage}
                    </div>
                    {companion.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{companion.name}, {companion.age}</h3>
                      {companion.verified && (
                        <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs py-0 px-1.5">
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">{companion.location}</span>
                      {companion.mutualInterests > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-primary truncate">{companion.mutualInterests} mutual</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-foreground mb-2 sm:mb-3 line-clamp-2">{companion.bio}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {companion.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-[10px] sm:text-xs py-0.5 px-1.5">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-primary text-white border-0 text-xs h-8 px-3">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Connect
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onToggleLike?.(companion.id)}
                        className={cn(
                          "h-8 w-8 p-0",
                          likedCompanions.includes(companion.id) && "text-red-500 border-red-500 hover:bg-red-50"
                        )}
                      >
                        <Heart 
                          className={cn(
                            "w-3.5 h-3.5 sm:w-4 sm:h-4",
                            likedCompanions.includes(companion.id) && "fill-red-500"
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Community Features</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                Share tips, ask questions, and connect with fellow travelers
              </p>
              <Button className="bg-gradient-primary text-white border-0 text-xs sm:text-sm h-9">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
            <div className="mb-4">
              <Button className="bg-gradient-primary text-white border-0 w-full text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                Create New Group
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {groups.map((group) => (
                <Card key={group.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{group.name}</h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span className="whitespace-nowrap">{group.members} members</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-[10px] sm:text-xs py-0 px-1.5">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={group.joined ? "outline" : "default"}
                      className={cn(
                        "flex-shrink-0 text-xs h-7 sm:h-9 px-2 sm:px-3",
                        !group.joined && "bg-gradient-primary text-white border-0"
                      )}
                    >
                      {group.joined ? "Joined" : (
                        <>
                          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-2" />
                          <span className="hidden sm:inline">Join</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{group.description}</p>
                  
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Last activity {group.lastActivity}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Safety Notice */}
        <div className="p-3 sm:p-4 bg-muted/30 border-t border-border">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">
              Always meet in public places. Your safety is our priority.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionPage;