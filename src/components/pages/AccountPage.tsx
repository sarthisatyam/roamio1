import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Edit, 
  Users,
  Shield,
  Crown,
  Headphones,
  LogOut,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Heart,
  Star,
  Bookmark,
  Settings,
  CheckCircle,
  Calendar,
  X,
  Plus,
  Trash2,
  Languages
} from "lucide-react";
import { 
  EmergencyDialog, 
  ParentalControlDialog, 
  VerifyDialog, 
  SupportDialog, 
  MyBookingsDialog 
} from "@/components/dialogs/AccountSectionDialogs";
import TravelGuideDialog from "@/components/dialogs/TravelGuideDialog";

interface AccountPageProps {
  userData: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onNavigateBack: () => void;
  onLogout: () => void;
  likedCompanions?: number[];
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
}

const AccountPage: React.FC<AccountPageProps> = ({ userData, onNavigateBack, onLogout, likedCompanions = [], bookmarkedPlaces = [] }) => {
  const accountType = "Free";
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dialog states
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [parentalDialogOpen, setParentalDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false);
  const [travelGuideDialogOpen, setTravelGuideDialogOpen] = useState(false);

  // Mock companion data for displaying liked companions with detailed info
  const companions = [
    { 
      id: 1, 
      name: "Priya Sharma", 
      profileImage: "👩‍💻", 
      age: 28, 
      location: "Mumbai, India",
      bio: "Tech enthusiast and travel lover",
      interests: ["Technology", "Photography", "Hiking"],
      gender: "Female",
      status: "online"
    },
    { 
      id: 2, 
      name: "Ananya Patel", 
      profileImage: "👩‍🎨", 
      age: 25, 
      location: "Delhi, India",
      bio: "Artist exploring the world",
      interests: ["Art", "Culture", "Museums"],
      gender: "Female",
      status: "offline"
    },
    { 
      id: 3, 
      name: "Arjun Singh", 
      profileImage: "👨‍🦱", 
      age: 30, 
      location: "Bangalore, India",
      bio: "Adventure seeker and foodie",
      interests: ["Adventure", "Food", "Sports"],
      gender: "Male",
      status: "online"
    },
    { 
      id: 4, 
      name: "Meera Reddy", 
      profileImage: "👩‍🍳", 
      age: 26, 
      location: "Chennai, India",
      bio: "Chef who loves exploring cuisines",
      interests: ["Cooking", "Culture", "Food"],
      gender: "Female",
      status: "offline"
    }
  ];

  // Mock user interests data
  const userInterests = {
    gender: userData?.preferences?.includes('Male') ? 'Male' : userData?.preferences?.includes('Female') ? 'Female' : 'Not specified',
    age: 25, // This could be from userData
    interests: userData?.preferences || ["Adventure", "Culture", "Food"],
    about: "Passionate traveler looking for authentic experiences and meaningful connections."
  };

  const likedCompanionProfiles = companions.filter(c => likedCompanions.includes(c.id));




  const handleSectionClick = (sectionTitle: string) => {
    if (['My Co-Companion', 'Travel List', 'My Interests'].includes(sectionTitle)) {
      setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
      setIsEditing(false);
    }
  };

  const renderDetailedSection = () => {
    if (!activeSection) return null;

    return (
      <Card className="mb-6 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{activeSection}</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-1" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveSection(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeSection === 'My Co-Companion' && (
            <div className="space-y-4">
              {likedCompanionProfiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No companions added yet</p>
              ) : (
                likedCompanionProfiles.map((companion) => (
                  <div key={companion.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 text-2xl flex items-center justify-center bg-muted rounded-full">
                          {companion.profileImage}
                        </div>
                        <div>
                          <h4 className="font-semibold">{companion.name}</h4>
                          <p className="text-sm text-muted-foreground">{companion.age} years • {companion.location}</p>
                        </div>
                      </div>
                      {isEditing && (
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{companion.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {companion.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${companion.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground capitalize">{companion.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSection === 'Travel List' && (
            <div className="space-y-4">
              {bookmarkedPlaces.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No destinations saved yet</p>
              ) : (
                bookmarkedPlaces.map((place) => (
                  <div key={place.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 text-2xl flex items-center justify-center bg-muted rounded-full">
                          {place.image}
                        </div>
                        <div>
                          <h4 className="font-semibold">{place.name}</h4>
                          <p className="text-sm text-muted-foreground">Saved destination</p>
                        </div>
                      </div>
                      {isEditing && (
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isEditing && (
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              )}
            </div>
          )}

          {activeSection === 'My Interests' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm">{userInterests.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p className="text-sm">{userInterests.age} years</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Interests</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userInterests.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                      {isEditing && (
                        <X className="w-3 h-3 ml-1 cursor-pointer" />
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">About</label>
                <p className="text-sm mt-1">{userInterests.about}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const menuItems = [
    {
      icon: Calendar,
      title: "My Bookings",
      description: "View and manage your travel bookings",
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => setBookingsDialogOpen(true)
    },
    {
      icon: Users,
      title: "My Co-Companion",
      description: `${likedCompanionProfiles.length} saved companions`,
      color: "text-primary",
      bgColor: "bg-primary/10",
      companions: likedCompanionProfiles
    },
    {
      icon: Star,
      title: "My Interests",
      description: "Manage your travel preferences and interests",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Bookmark,
      title: "Travel List",
      description: `${bookmarkedPlaces.length} saved destinations`,
      color: "text-success",
      bgColor: "bg-success/10",
      places: bookmarkedPlaces
    },
    {
      icon: Languages,
      title: "Travel Guide",
      description: "Language assistant and travel tips",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: () => setTravelGuideDialogOpen(true)
    },
    {
      icon: Shield,
      title: "Emergency Details",
      description: "Emergency contacts and safety information",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      action: () => setEmergencyDialogOpen(true)
    },
    {
      icon: Settings,
      title: "Parental Control",
      description: "Manage safety settings and restrictions",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: () => setParentalDialogOpen(true)
    },
    {
      icon: CheckCircle,
      title: "Verify Yourself",
      description: "Complete your profile verification",
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => setVerifyDialogOpen(true)
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help and support",
      color: "text-success",
      bgColor: "bg-success/10",
      action: () => setSupportDialogOpen(true)
    }
  ];

  const getAccountTypeIcon = () => {
    switch (accountType.toLowerCase()) {
      case 'pro':
        return <Crown className="w-5 h-5 text-warning" />;
      case 'prime':
        return <Crown className="w-5 h-5 text-primary" />;
      default:
        return <User className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAccountTypeBadge = () => {
    switch (accountType.toLowerCase()) {
      case 'pro':
        return <Badge className="bg-warning text-warning-foreground">Pro</Badge>;
      case 'prime':
        return <Badge className="bg-primary text-primary-foreground">Prime</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-white text-center flex-1">Account</h1>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">{userData?.name || 'User'}</h2>
            <p className="text-white/80 text-xs">{userData?.emailOrPhone || 'No contact info'}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {getAccountTypeIcon()}
              {getAccountTypeBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* User Info Card */}
        <Card className="mb-4 shadow-soft rounded-2xl border-0">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="flex items-center gap-3">
              {userData?.emailOrPhone?.includes('@') ? (
                <Mail className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Phone className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs">{userData?.emailOrPhone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs">{userData?.language || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs">
                {userData?.locationEnabled ? 'Location enabled' : 'Location disabled'}
              </span>
            </div>
            {userData?.preferences && userData.preferences.length > 0 && (
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {userData.preferences.map((pref) => (
                    <Badge key={pref} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Section */}
        {renderDetailedSection()}



        <div className="space-y-3 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title} 
                className="p-3 shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    handleSectionClick(item.title);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    {item.companions && item.companions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {item.companions.slice(0, 3).map((companion) => (
                          <div key={companion.id} className="w-5 h-5 text-xs flex items-center justify-center bg-muted rounded-full">
                            {companion.profileImage}
                          </div>
                        ))}
                        {item.companions.length > 3 && (
                          <div className="w-5 h-5 text-[10px] flex items-center justify-center bg-muted rounded-full text-muted-foreground">
                            +{item.companions.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    {item.places && item.places.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {item.places.slice(0, 3).map((place) => (
                          <div key={place.id} className="w-5 h-5 text-xs flex items-center justify-center bg-muted rounded-full">
                            {place.image}
                          </div>
                        ))}
                        {item.places.length > 3 && (
                          <div className="w-5 h-5 text-[10px] flex items-center justify-center bg-muted rounded-full text-muted-foreground">
                            +{item.places.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Logout */}
        <Card className="p-3 shadow-soft border-destructive/20 rounded-2xl">
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>

      {/* Dialogs */}
      <MyBookingsDialog open={bookingsDialogOpen} onOpenChange={setBookingsDialogOpen} />
      <EmergencyDialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen} />
      <ParentalControlDialog open={parentalDialogOpen} onOpenChange={setParentalDialogOpen} />
      <VerifyDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen} />
      <SupportDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen} />
      <TravelGuideDialog open={travelGuideDialogOpen} onOpenChange={setTravelGuideDialogOpen} />
    </div>
  );
};

export default AccountPage;