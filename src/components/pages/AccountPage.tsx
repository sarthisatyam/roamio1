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
  Languages,
  Volume2,
  BookOpen,
  Search,
  Mic,
  MicOff
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [translatorText, setTranslatorText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [activeLanguageSection, setActiveLanguageSection] = useState("phrases");
  const [isListening, setIsListening] = useState(false);
  const [isTranslatorListening, setIsTranslatorListening] = useState(false);

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

  // Language Guide Data
  const languageGuides = [
    { phrase: "Hello", translation: "नमस्ते (Namaste)", pronunciation: "na-mas-te" },
    { phrase: "Thank you", translation: "धन्यवाद (Dhanyawad)", pronunciation: "dhan-ya-wad" },
    { phrase: "Excuse me", translation: "माफ़ करें (Maaf kariye)", pronunciation: "maaf ka-ri-ye" },
    { phrase: "How much?", translation: "कितना? (Kitna?)", pronunciation: "kit-na" },
    { phrase: "Where is?", translation: "कहाँ है? (Kahan hai?)", pronunciation: "ka-han hai" },
    { phrase: "Help me", translation: "मेरी मदद करें (Meri madad kariye)", pronunciation: "me-ri ma-dad ka-ri-ye" },
    { phrase: "I don't understand", translation: "मैं समझा नहीं (Main samjha nahi)", pronunciation: "main sam-jha na-hi" },
    { phrase: "Do you speak English?", translation: "क्या आप अंग्रेजी बोलते हैं? (Kya aap angrezi bolte hain?)", pronunciation: "kya aap ang-re-zi bol-te hain" }
  ];

  const handleTranslate = () => {
    if (translatorText.trim()) {
      setTranslatedText(`${translatorText} → हिंदी में अनुवाद`);
    }
  };

  const startListening = (type: 'search' | 'translator') => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (type === 'search') {
        setIsListening(true);
      } else {
        setIsTranslatorListening(true);
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (type === 'search') {
          setLanguageSearchTerm(transcript);
        } else {
          setTranslatorText(transcript);
        }
      };

      recognition.onerror = () => {
        if (type === 'search') {
          setIsListening(false);
        } else {
          setIsTranslatorListening(false);
        }
      };

      recognition.onend = () => {
        if (type === 'search') {
          setIsListening(false);
        } else {
          setIsTranslatorListening(false);
        }
      };

      recognition.start();
    }
  };

  const filteredLanguageGuides = languageGuides.filter(guide => 
    guide.phrase.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
    guide.translation.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );


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
      icon: Languages,
      title: "Travel Guide",
      description: "Language assistant and travel tips",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: () => setShowGuide(true)
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

        {/* Detailed Section */}
        {renderDetailedSection()}

        {/* Travel Guide Section */}
        {showGuide && (
          <Card className="mb-6 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                Travel Guide
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowGuide(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Hindi phrases..."
                    value={languageSearchTerm}
                    onChange={(e) => setLanguageSearchTerm(e.target.value)}
                    className="pl-10 pr-12"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startListening('search')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-destructive" />
                    ) : (
                      <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Language subsections */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card 
                  className={`p-3 cursor-pointer hover:shadow-soft transition-all ${activeLanguageSection === "translator" ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveLanguageSection("translator")}
                >
                  <div className="text-center">
                    <Volume2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Translator</p>
                    <p className="text-xs text-muted-foreground">Voice & text</p>
                  </div>
                </Card>
                <Card 
                  className={`p-3 cursor-pointer hover:shadow-soft transition-all ${activeLanguageSection === "learn" ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveLanguageSection("learn")}
                >
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Learn</p>
                    <p className="text-xs text-muted-foreground">Basic lessons</p>
                  </div>
                </Card>
              </div>

              {/* Translator Section */}
              {activeLanguageSection === "translator" && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Text Translator</h4>
                  <div className="relative">
                    <Input 
                      placeholder="Enter text to translate to Hindi..."
                      value={translatorText}
                      onChange={(e) => setTranslatorText(e.target.value)}
                      className="pr-12"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startListening('translator')}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                    >
                      {isTranslatorListening ? (
                        <MicOff className="w-4 h-4 text-destructive" />
                      ) : (
                        <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={handleTranslate} className="w-full">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Translate
                  </Button>
                  {translatedText && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{translatedText}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Learn Section */}
              {activeLanguageSection === "learn" && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Hindi Lessons</h4>
                  <Card className="p-3 cursor-pointer hover:bg-muted/50">
                    <h5 className="font-medium text-sm mb-1">Basic Greetings</h5>
                    <p className="text-xs text-muted-foreground">Learn common Hindi greetings</p>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-muted/50">
                    <h5 className="font-medium text-sm mb-1">Numbers 1-10</h5>
                    <p className="text-xs text-muted-foreground">Essential counting in Hindi</p>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-muted/50">
                    <h5 className="font-medium text-sm mb-1">Travel Phrases</h5>
                    <p className="text-xs text-muted-foreground">Useful phrases for getting around</p>
                  </Card>
                </div>
              )}

              {/* Essential Hindi Phrases */}
              {activeLanguageSection === "phrases" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Essential Phrases</h4>
                  {filteredLanguageGuides.map((guide, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{guide.phrase}</p>
                          <p className="text-sm text-primary">{guide.translation}</p>
                          <p className="text-xs text-muted-foreground">{guide.pronunciation}</p>
                        </div>
                        <Volume2 className="w-4 h-4 text-primary cursor-pointer hover:text-primary/80 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Solo Travel Tips */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-3">Solo Travel Tips for Delhi</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Use Delhi Metro for efficient and safe travel</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Uber/Ola are reliable ride options</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Try street food at Chandni Chowk</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Emergency: Police - 100, Tourist Helpline - 1363</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-3 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title} 
                className="p-4 shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    handleSectionClick(item.title);
                  }
                }}
              >
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