import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  UserPlus,
  User,
  Compass,
  Globe,
  Sparkles,
  Star,
  Zap,
  Mountain
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
    interests: [] as string[]
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
      icon: Briefcase,
      description: "Community for remote workers exploring Delhi NCR",
      lastActivity: "2 hours ago",
      joined: true
    },
    {
      id: 2,
      name: "Solo Female Travelers - India",
      members: 189,
      category: "Safety",
      icon: Shield,
      description: "Safe space for women traveling solo across India",
      lastActivity: "1 hour ago", 
      joined: false
    },
    {
      id: 3,
      name: "Street Food Adventures",
      members: 256,
      category: "Food",
      icon: Coffee,
      description: "Discover the best Indian street food experiences together",
      lastActivity: "30 minutes ago",
      joined: true
    }
  ];

  const filteredCompanions = companions.filter(companion => {
    if (filters.gender !== 'all' && companion.gender !== filters.gender) {
      return false;
    }
    if (filters.status === 'online' && !companion.online) {
      return false;
    }
    if (companion.distance > filters.radius[0]) {
      return false;
    }
    if (companion.age < filters.ageRange[0] || companion.age > filters.ageRange[1]) {
      return false;
    }
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

  const interestIcons: Record<string, React.ReactNode> = {
    "Coworking": <Briefcase className="w-3 h-3" />,
    "Chai Spots": <Coffee className="w-3 h-3" />,
    "Photography": <Camera className="w-3 h-3" />,
    "Temples": <Mountain className="w-3 h-3" />,
    "Heritage": <Globe className="w-3 h-3" />,
    "Local Markets": <MapPin className="w-3 h-3" />,
    "Trekking": <Compass className="w-3 h-3" />,
    "Adventure Sports": <Zap className="w-3 h-3" />,
    "Street Food": <Coffee className="w-3 h-3" />,
    "Cultural Events": <Music className="w-3 h-3" />,
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero p-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Companions
            </h1>
            <p className="text-white/80 text-xs">Connect with verified travelers</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by interests or cities..."
            className="pl-10 text-sm bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-3 mx-4 mt-3 h-11 rounded-xl">
            <TabsTrigger value="discover" className="text-xs rounded-lg flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs rounded-lg flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="community" className="text-xs rounded-lg flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Community
            </TabsTrigger>
          </TabsList>

          {/* Filters - only show on Discover tab */}
          {activeTab === "discover" && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                  <Badge variant="outline" className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg">
                    <Users className="w-3 h-3" />
                    {filters.gender === 'all' ? 'All' : filters.gender === 'female' ? 'Female' : 'Male'}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {filters.radius[0]}km
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {filters.status === 'all' ? 'All' : 'Online'}
                  </Badge>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex-shrink-0">
                      <Filter className="w-3.5 h-3.5 mr-1.5" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 rounded-xl" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Filters
                      </h4>
                      
                      {/* Gender Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block">Gender</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['all', 'female', 'male'].map((gender) => (
                            <Button
                              key={gender}
                              variant={filters.gender === gender ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, gender }))}
                              className={cn(
                                "capitalize text-xs h-8 rounded-lg",
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
                        <label className="text-xs font-medium mb-2 block">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['all', 'online'].map((status) => (
                            <Button
                              key={status}
                              variant={filters.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, status }))}
                              className={cn(
                                "capitalize text-xs h-8 rounded-lg",
                                filters.status === status && "bg-gradient-primary text-white border-0"
                              )}
                            >
                              {status === 'online' && <div className="w-2 h-2 rounded-full bg-success mr-1.5" />}
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Radius Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary" />
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
                        <label className="text-xs font-medium mb-2 block">
                          Age: {filters.ageRange[0]}-{filters.ageRange[1]}
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
                        className="w-full text-xs h-9 rounded-lg"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Discover Tab */}
          <TabsContent value="discover" className="flex-1 overflow-y-auto px-4 pt-1 pb-20">
            <div className="space-y-3">
              {filteredCompanions.map((companion) => (
                <Card key={companion.id} className="p-3 shadow-soft rounded-2xl border-0">
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                        {companion.profileImage}
                      </div>
                      {companion.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm truncate">{companion.name}, {companion.age}</h3>
                            {companion.verified && (
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{companion.location}</span>
                            {companion.mutualInterests > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-primary font-medium">{companion.mutualInterests} mutual</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onToggleLike?.(companion.id)}
                          className={cn(
                            "w-8 h-8 rounded-full",
                            likedCompanions.includes(companion.id) && "text-destructive"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", likedCompanions.includes(companion.id) && "fill-current")} />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{companion.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {companion.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg flex items-center gap-1">
                            {interestIcons[interest]}
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-primary text-white border-0 text-xs h-9 rounded-xl">
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                          Connect
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-9 rounded-xl px-3"
                        >
                          <User className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredCompanions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">No companions found</h3>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            <div className="space-y-3">
              {groups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <Card key={group.id} className="p-3 shadow-soft rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Users className="w-3 h-3" />
                              <span>{group.members} members</span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{group.category}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{group.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Active {group.lastActivity}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant={group.joined ? "outline" : "default"}
                            className={cn(
                              "text-xs h-8 rounded-xl px-4",
                              !group.joined && "bg-gradient-primary text-white border-0"
                            )}
                          >
                            {group.joined ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Joined
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                Join
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            <div className="space-y-4">
              {/* Community Stats */}
              <Card className="p-4 shadow-soft rounded-2xl border-0 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Community Stats</h3>
                    <p className="text-xs text-muted-foreground">Your travel network</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-background rounded-xl">
                    <div className="text-xl font-bold text-primary">156</div>
                    <div className="text-[10px] text-muted-foreground">Connections</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-xl">
                    <div className="text-xl font-bold text-primary">12</div>
                    <div className="text-[10px] text-muted-foreground">Trips Shared</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-xl">
                    <div className="text-xl font-bold text-primary">4.8</div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      Rating
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Recent Activity
                </h4>
                
                <div className="space-y-2">
                  {[
                    { icon: "👋", text: "Priya connected with you", time: "2 hours ago" },
                    { icon: "🎉", text: "You joined Delhi Digital Nomads", time: "1 day ago" },
                    { icon: "⭐", text: "Arjun rated your trip 5 stars", time: "3 days ago" },
                  ].map((activity, idx) => (
                    <Card key={idx} className="p-3 shadow-soft rounded-xl border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{activity.text}</p>
                          <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Safety Features */}
              <Card className="p-4 shadow-soft rounded-2xl border-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Safety First</h3>
                    <p className="text-xs text-muted-foreground">Your safety is our priority</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { icon: CheckCircle, text: "All companions are ID verified" },
                    { icon: Shield, text: "24/7 emergency support available" },
                    { icon: MapPin, text: "Live location sharing with trusted contacts" },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <feature.icon className="w-4 h-4 text-success" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanionPage;
