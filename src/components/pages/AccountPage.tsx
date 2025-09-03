import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Ticket,
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
  Map,
  Bookmark,
  Settings,
  CheckCircle
} from "lucide-react";

interface AccountPageProps {
  userData: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onNavigateBack: () => void;
  onLogout: () => void;
  likedCompanions?: number[];
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
}

const AccountPage: React.FC<AccountPageProps> = ({ userData, onNavigateBack, onLogout, likedCompanions = [], bookmarkedPlaces = [] }) => {
  const accountType = "Free"; // This could be dynamic based on user subscription

  // Mock companion data for displaying liked companions
  const companions = [
    { id: 1, name: "Priya Sharma", profileImage: "👩‍💻" },
    { id: 2, name: "Ananya Patel", profileImage: "👩‍🎨" },
    { id: 3, name: "Arjun Singh", profileImage: "👨‍🦱" },
    { id: 4, name: "Meera Reddy", profileImage: "👩‍🍳" }
  ];

  const likedCompanionProfiles = companions.filter(c => likedCompanions.includes(c.id));


  const menuItems = [
    {
      icon: Bookmark,
      title: "My Bookings",
      description: "View and manage your travel bookings",
      color: "text-primary",
      bgColor: "bg-primary/10"
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
      icon: Ticket,
      title: "My Coupons",
      description: "View and manage your discount coupons",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: Shield,
      title: "Emergency Details",
      description: "Emergency contacts and safety information",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      icon: Settings,
      title: "Parental Control",
      description: "Manage safety settings and restrictions",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: CheckCircle,
      title: "Verify Yourself",
      description: "Complete your profile verification",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help and support",
      color: "text-success",
      bgColor: "bg-success/10"
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
      <div className="bg-gradient-hero p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">Account</h1>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{userData?.name || 'User'}</h2>
            <p className="text-white/80 text-sm">{userData?.emailOrPhone || 'No contact info'}</p>
            <div className="flex items-center gap-2 mt-2">
              {getAccountTypeIcon()}
              {getAccountTypeBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* User Info Card */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {userData?.emailOrPhone?.includes('@') ? (
                <Mail className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Phone className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">{userData?.emailOrPhone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{userData?.language || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {userData?.locationEnabled ? 'Location enabled' : 'Location disabled'}
              </span>
            </div>
            {userData?.preferences && userData.preferences.length > 0 && (
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {userData.preferences.map((pref) => (
                    <Badge key={pref} variant="secondary" className="text-xs">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-4 shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {item.companions && item.companions.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.companions.slice(0, 3).map((companion) => (
                          <div key={companion.id} className="w-6 h-6 text-sm flex items-center justify-center bg-muted rounded-full">
                            {companion.profileImage}
                          </div>
                        ))}
                        {item.companions.length > 3 && (
                          <div className="w-6 h-6 text-xs flex items-center justify-center bg-muted rounded-full text-muted-foreground">
                            +{item.companions.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    {item.places && item.places.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.places.slice(0, 3).map((place) => (
                          <div key={place.id} className="w-6 h-6 text-sm flex items-center justify-center bg-muted rounded-full">
                            {place.image}
                          </div>
                        ))}
                        {item.places.length > 3 && (
                          <div className="w-6 h-6 text-xs flex items-center justify-center bg-muted rounded-full text-muted-foreground">
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
        <Card className="p-4 shadow-soft border-destructive/20">
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;