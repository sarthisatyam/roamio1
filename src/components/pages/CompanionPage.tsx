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
      <div className="bg-gradient-hero p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Find Companions</h1>
            <p className="text-white/80 text-sm">Connect with verified solo travelers near you</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToAccount}
            className="w-10 h-10 rounded-full bg-secondary/90 text-foreground hover:bg-secondary border-secondary"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by interests or Indian cities..."
            className="pl-10 bg-white/95 backdrop-blur border-0 shadow-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Filters - only show on Discover tab */}
          {activeTab === "discover" && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {filters.gender === 'all' ? 'All' : filters.gender === 'female' ? 'Females' : 'Males'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    Within {filters.radius[0]}km
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {filters.status === 'all' ? 'All' : 'Online only'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    Ages {filters.ageRange[0]}-{filters.ageRange[1]}
                  </Badge>
                  {filters.interests.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      {filters.interests.length} interests
                    </Badge>
                  )}
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
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
          <TabsContent value="discover" className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-4">
            {filteredCompanions.map((companion) => (
              <Card key={companion.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 text-4xl flex items-center justify-center">
                      {companion.profileImage}
                    </div>
                    {companion.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{companion.name}, {companion.age}</h3>
                      {companion.verified && (
                        <Badge className="bg-success text-success-foreground text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{companion.location}</span>
                      {companion.mutualInterests > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-primary">{companion.mutualInterests} mutual interests</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground mb-3">{companion.bio}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {companion.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-primary text-white border-0">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onToggleLike?.(companion.id)}
                        className={cn(
                          likedCompanions.includes(companion.id) && "text-red-500 border-red-500 hover:bg-red-50"
                        )}
                      >
                        <Heart 
                          className={cn(
                            "w-4 h-4",
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
          <TabsContent value="community" className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Features</h3>
              <p className="text-muted-foreground mb-4">
                Share tips, ask questions, and connect with fellow travelers
              </p>
              <Button className="bg-gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="mb-4">
              <Button className="bg-gradient-primary text-white border-0 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            </div>
            <div className="space-y-4">
              {groups.map((group) => (
                <Card key={group.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{group.members} members</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={group.joined ? "outline" : "default"}
                      className={cn(
                        !group.joined && "bg-gradient-primary text-white border-0"
                      )}
                    >
                      {group.joined ? "Joined" : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Last activity {group.lastActivity}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Safety Notice */}
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
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