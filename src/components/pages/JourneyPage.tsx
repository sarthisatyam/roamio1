import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  Globe,
  Bookmark,
  CheckCircle,
  Languages,
  Volume2,
  BookOpen,
  TrendingUp,
  PieChart,
  Camera,
  Map as MapIcon,
  List,
  User,
  Search,
  Home,
  UtensilsCrossed,
  Car,
  Ticket,
  ShoppingBag,
  Mic,
  MicOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyPageProps {
  onNavigateToAccount?: () => void;
}

const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToAccount }) => {
  const [activeTab, setActiveTab] = useState("guide");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [translatorText, setTranslatorText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [activeLanguageSection, setActiveLanguageSection] = useState("phrases");
  const [isListening, setIsListening] = useState(false);
  const [isTranslatorListening, setIsTranslatorListening] = useState(false);

  const allActivities = [
    // Past activities (completed)
    {
      id: 1,
      title: "Morning Walk at Lodhi Gardens",
      time: "07:00 AM",
      location: "Lodhi Road, Delhi",
      type: "Exercise",
      duration: "1 hour",
      status: "completed",
      date: "Yesterday"
    },
    {
      id: 2,
      title: "Shopping at Connaught Place",
      time: "11:00 AM", 
      location: "CP, New Delhi",
      type: "Shopping",
      duration: "2 hours",
      status: "completed",
      date: "Yesterday"
    },
    // Today's activities
    {
      id: 3,
      title: "Visit Red Fort",
      time: "09:00 AM",
      location: "Chandni Chowk, Delhi",
      type: "Heritage",
      duration: "2 hours",
      status: "planned",
      date: "Today"
    },
    {
      id: 4,
      title: "Street Food at Paranthe Wali Gali",
      time: "12:30 PM", 
      location: "Old Delhi",
      type: "Food",
      duration: "1 hour",
      status: "planned",
      date: "Today"
    },
    {
      id: 5,
      title: "Sunset at India Gate",
      time: "06:00 PM",
      location: "Rajpath, New Delhi",
      type: "Scenic",
      duration: "1.5 hours",
      status: "planned",
      date: "Today"
    },
    // Future activity
    {
      id: 6,
      title: "Visit Akshardham Temple",
      time: "10:00 AM",
      location: "Akshardham, Delhi",
      type: "Religious",
      duration: "3 hours",
      status: "planned",
      date: "Mar 25"
    }
  ];

  const expenses = [
    { category: "Accommodation", amount: 3500, budget: 5000, icon: Home },
    { category: "Food & Drinks", amount: 2400, budget: 4000, icon: UtensilsCrossed },
    { category: "Transportation", amount: 1200, budget: 2500, icon: Car },
    { category: "Activities", amount: 1800, budget: 3000, icon: Ticket },
    { category: "Shopping", amount: 800, budget: 1500, icon: ShoppingBag }
  ];

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);

  const pastTrips = [
    {
      id: 1,
      destination: "Rajasthan, India",
      dates: "Mar 15-22, 2024",
      duration: "7 days",
      image: "🏰",
      highlights: ["Amber Fort", "City Palace", "Hawa Mahal"],
      rating: 5
    },
    {
      id: 2,
      destination: "Kerala Backwaters", 
      dates: "Feb 8-12, 2024",
      duration: "4 days",
      image: "🌴",
      highlights: ["Houseboat Stay", "Spice Gardens", "Kathakali Show"],
      rating: 4
    }
  ];

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
      // Simple mock translation - in real app would use translation API
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

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
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
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const filteredLanguageGuides = languageGuides.filter(guide => 
    guide.phrase.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
    guide.translation.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Your Journey</h1>
            <p className="text-white/80 text-sm">Track, plan, and remember your adventures</p>
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
        
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
          <TabsTrigger value="guide">Guide</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="trips">Past Trips</TabsTrigger>
        </TabsList>

          {/* Activity Planner Tab */}
          <TabsContent value="planner" className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Current Trip Overview */}
          <Card className="p-4 mb-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Current Trip: Delhi</h3>
                <p className="text-sm text-muted-foreground">March 20-25, 2024 • 3 days left</p>
              </div>
              <Badge className="bg-success text-success-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <Progress value={60} className="mb-3" />
            <p className="text-sm text-muted-foreground">60% of activities completed</p>
          </Card>

          {/* Today's Activities */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Activities Timeline</h2>
              <Button size="sm" className="bg-gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            <div className="space-y-3">
              {allActivities.map((activity, index) => {
                const isCompleted = activity.status === "completed";
                const isFuture = activity.date === "Mar 25";
                
                return (
                  <Card key={activity.id} className={cn(
                    "p-4 shadow-soft transition-all",
                    isCompleted && "opacity-60 bg-muted/30"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                          isCompleted 
                            ? "bg-success/20 text-success" 
                            : isFuture 
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index - 1 // Adjust for completed items
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              "font-medium",
                              isCompleted && "line-through"
                            )}>
                              {activity.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {activity.date}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{activity.time}</span>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{activity.location}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {activity.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!isCompleted && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MapIcon className="w-6 h-6" />
              <span className="text-sm">View on Map</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Add Photos</span>
            </Button>
          </div>
        </TabsContent>

          {/* Expense Tracker Tab */}
          <TabsContent value="expenses" className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Budget Overview */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Trip Budget</h3>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary mb-1">₹{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                of ₹{totalBudget.toLocaleString()} budget ({Math.round((totalSpent / totalBudget) * 100)}% used)
              </div>
              <Progress value={(totalSpent / totalBudget) * 100} className="mt-3" />
            </div>
          </Card>

          {/* Expense Categories */}
          <div className="space-y-3">
            {expenses.map((expense) => {
              const IconComponent = expense.icon;
              return (
                <Card key={expense.category} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{expense.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">of ₹{expense.budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <Progress value={(expense.amount / expense.budget) * 100} className="h-2" />
                </Card>
              );
            })}
          </div>
        </TabsContent>

          {/* Past Trips Tab */}
          <TabsContent value="trips" className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-4">
            {pastTrips.map((trip) => (
              <Card key={trip.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{trip.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{trip.destination}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < trip.rating ? "text-yellow-500" : "text-muted-foreground"
                            )}
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{trip.dates} • {trip.duration}</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.map((highlight) => (
                        <Badge key={highlight} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    View Itinerary
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Photos
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

          {/* Language Guide Tab */}
          <TabsContent value="guide" className="flex-1 overflow-y-auto p-6 pt-4">
            {/* Language Section */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Languages className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Language Assistant</h3>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
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
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Card 
                  className={cn(
                    "p-3 cursor-pointer hover:shadow-soft transition-all",
                    activeLanguageSection === "translator" && "ring-2 ring-primary"
                  )}
                  onClick={() => setActiveLanguageSection("translator")}
                >
                  <div className="text-center">
                    <Volume2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Translator</p>
                    <p className="text-xs text-muted-foreground">Voice & text</p>
                  </div>
                </Card>
                <Card 
                  className={cn(
                    "p-3 cursor-pointer hover:shadow-soft transition-all",
                    activeLanguageSection === "learn" && "ring-2 ring-primary"
                  )}
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
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground">Text Translator</h4>
                  <div className="space-y-3">
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
                </div>
              )}

              {/* Learn Section */}
              {activeLanguageSection === "learn" && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground">Hindi Lessons</h4>
                  <div className="grid grid-cols-1 gap-3">
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
                </div>
              )}

              {/* Essential Hindi Phrases - Always visible when no specific section */}
              {activeLanguageSection === "phrases" && (
                <div className="space-y-3">
                   <h4 className="text-sm font-medium text-muted-foreground mb-3">Essential Phrases</h4>
                   {filteredLanguageGuides.map((guide, index) => (
                     <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                       <div className="grid grid-cols-3 gap-4">
                         <div className="flex items-center gap-2">
                           <Volume2 className="w-4 h-4 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
                           <p className="font-medium text-sm">{guide.phrase}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Volume2 className="w-4 h-4 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
                           <p className="font-medium text-sm text-primary">{guide.translation}</p>
                         </div>
                         <div>
                           <p className="text-xs text-muted-foreground">{guide.pronunciation}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </Card>

            {/* Solo Travel Tips for Delhi */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Solo Travel Tips for Delhi</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Use Delhi Metro for efficient and safe travel - buy a tourist card for unlimited rides</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Uber/Ola are reliable ride options - avoid auto-rickshaws near tourist spots (overpriced)</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Try street food at Chandni Chowk but stick to busy stalls with high turnover</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Carry water bottle and stay hydrated - Delhi can get very hot and dusty</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Visit Red Fort and India Gate early morning to avoid crowds and heat</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Keep emergency contacts: Police - 100, Tourist Helpline - 1363</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Bargain at markets like Karol Bagh and Sarojini Nagar - start at 30% of asking price</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Book accommodations in safe areas like Connaught Place, Paharganj, or Karol Bagh</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JourneyPage;