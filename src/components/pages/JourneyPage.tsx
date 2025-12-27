// import React, { useState, useEffect } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Calendar,
//   MapPin,
//   Clock,
//   Plus,
//   Edit,
//   CheckCircle,
//   Camera,
//   User,
//   Home,
//   UtensilsCrossed,
//   Car,
//   Ticket,
//   ShoppingBag,
//   Search
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// import ActivityDialog, { Activity } from "@/components/dialogs/ActivityDialog";
// import ExpenseDialog from "@/components/dialogs/ExpenseDialog";

// interface JourneyPageProps {
//   onNavigateToAccount?: () => void;
//   externalActivities?: { title: string; location: string; type: string }[];
// }

// const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToAccount, externalActivities = [] }) => {
//   const [activeTab, setActiveTab] = useState("planner");
//   const [activityDialogOpen, setActivityDialogOpen] = useState(false);
//   const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
//   const [activityDialogMode, setActivityDialogMode] = useState<"add" | "edit">("add");
//   const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
//   const [addedExternalCount, setAddedExternalCount] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [activities, setActivities] = useState<Activity[]>([
//     { id: 1, title: "Morning Walk at Lodhi Gardens", time: "07:00 AM", location: "Lodhi Road, Delhi", type: "Exercise", duration: "1 hour", status: "completed", date: "Yesterday" },
//     { id: 2, title: "Shopping at Connaught Place", time: "11:00 AM", location: "CP, New Delhi", type: "Shopping", duration: "2 hours", status: "completed", date: "Yesterday" },
//     { id: 3, title: "Visit Red Fort", time: "09:00 AM", location: "Chandni Chowk, Delhi", type: "Heritage", duration: "2 hours", status: "planned", date: "Today" },
//     { id: 4, title: "Street Food at Paranthe Wali Gali", time: "12:30 PM", location: "Old Delhi", type: "Food", duration: "1 hour", status: "planned", date: "Today" },
//     { id: 5, title: "Sunset at India Gate", time: "06:00 PM", location: "Rajpath, New Delhi", type: "Scenic", duration: "1.5 hours", status: "planned", date: "Today" },
//     { id: 6, title: "Visit Akshardham Temple", time: "10:00 AM", location: "Akshardham, Delhi", type: "Religious", duration: "3 hours", status: "planned", date: "Mar 25" }
//   ]);

//   // Add external activities when they change
//   useEffect(() => {
//     if (externalActivities.length > addedExternalCount) {
//       const newActivities = externalActivities.slice(addedExternalCount).map((ext, idx) => ({
//         id: Date.now() + idx,
//         title: ext.title,
//         time: "TBD",
//         location: ext.location,
//         type: ext.type,
//         duration: "TBD",
//         status: "planned" as const,
//         date: "Planned"
//       }));
//       setActivities(prev => [...prev, ...newActivities]);
//       setAddedExternalCount(externalActivities.length);
//     }
//   }, [externalActivities, addedExternalCount]);

//   const [expenses, setExpenses] = useState([
//     { category: "Accommodation", amount: 3500, budget: 5000, icon: Home },
//     { category: "Food & Drinks", amount: 2400, budget: 4000, icon: UtensilsCrossed },
//     { category: "Transportation", amount: 1200, budget: 2500, icon: Car },
//     { category: "Activities", amount: 1800, budget: 3000, icon: Ticket },
//     { category: "Shopping", amount: 800, budget: 1500, icon: ShoppingBag }
//   ]);

//   const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
//   const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);
//   const completedCount = activities.filter(a => a.status === "completed").length;
//   const progressPercent = Math.round((completedCount / activities.length) * 100);

//   // Filter activities based on search
//   const filteredActivities = activities.filter(activity =>
//     activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     activity.type.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Filter expenses based on search
//   const filteredExpenses = expenses.filter(expense =>
//     expense.category.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: number }) => {
//     if (activityData.id) {
//       setActivities(prev => prev.map(a => a.id === activityData.id ? { ...activityData, id: a.id } as Activity : a));
//     } else {
//       setActivities(prev => [...prev, { ...activityData, id: Date.now() } as Activity]);
//     }
//   };

//   const handleCompleteActivity = (id: number) => {
//     setActivities(prev => prev.map(a => a.id === id ? { ...a, status: "completed" as const } : a));
//     toast.success("Activity marked as complete!");
//   };

//   const handleAddExpense = (expense: { category: string; amount: number }) => {
//     setExpenses(prev => prev.map(e => e.category === expense.category ? { ...e, amount: e.amount + expense.amount } : e));
//   };

//   return (
//     <div className="flex flex-col h-full bg-background">
//       {/* Header */}
//       <div className="bg-gradient-hero px-4 py-3 pb-5">
//         <div className="flex items-center justify-between mb-3">
//           <div>
//             <h1 className="text-lg font-bold text-white flex items-center gap-2">
//               <Calendar className="w-4 h-4" />
//               Your Journey
//             </h1>
//             <p className="text-white/80 text-[10px]">Track, plan, and remember</p>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onNavigateToAccount}
//             className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30"
//           >
//             <User className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Search */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             placeholder="Search activities, expenses..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
//           />
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto">
//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
//           <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4 mt-3 h-11 rounded-xl bg-muted">
//             <TabsTrigger value="planner" className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
//               <Calendar className="w-4 h-4" />
//               Planner
//             </TabsTrigger>
//             <TabsTrigger value="expenses" className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
//               <ShoppingBag className="w-4 h-4" />
//               Expenses
//             </TabsTrigger>
//           </TabsList>

//           {/* Activity Planner Tab */}
//           <TabsContent value="planner" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
//           {/* Current Trip Overview */}
//           <Card className="p-3 mb-4 bg-gradient-card rounded-2xl border-0 shadow-soft">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <h3 className="font-semibold text-sm">Current Trip: Delhi</h3>
//                 <p className="text-[10px] text-muted-foreground">March 20-25, 2024 • 3 days left</p>
//               </div>
//               <Badge className="bg-success text-success-foreground text-[10px] py-0.5 px-2 rounded-lg">
//                 <Calendar className="w-3 h-3 mr-1" />
//                 Active
//               </Badge>
//             </div>

//             <Progress value={progressPercent} className="mb-2 h-2" />
//             <p className="text-[10px] text-muted-foreground">{progressPercent}% of activities completed</p>
//           </Card>

//           <div className="mb-4">
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-sm font-semibold">Activities Timeline</h2>
//               <Button
//                 size="sm"
//                 className="bg-gradient-primary text-white border-0 h-8 text-xs rounded-xl px-3"
//                 onClick={() => { setActivityDialogMode("add"); setSelectedActivity(null); setActivityDialogOpen(true); }}
//               >
//                 <Plus className="w-3.5 h-3.5 mr-1" />
//                 Add Activity
//               </Button>
//             </div>

//             <div className="space-y-3">
//               {filteredActivities.map((activity, index) => {
//                 const isCompleted = activity.status === "completed";
//                 const isFuture = activity.date === "Mar 25";

//                 return (
//                   <Card
//                     key={activity.id}
//                     className={cn(
//                       "p-3 shadow-soft rounded-2xl border-0 transition-all hover:shadow-medium",
//                       isCompleted && "opacity-70"
//                     )}
//                   >
//                     <div className="flex gap-3">
//                       {/* Status Icon */}
//                       <div className={cn(
//                         "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
//                         isCompleted
//                           ? "bg-success/20"
//                           : isFuture
//                             ? "bg-muted"
//                             : "bg-primary/10"
//                       )}>
//                         {isCompleted ? (
//                           <CheckCircle className="w-5 h-5 text-success" />
//                         ) : (
//                           <span className={cn(
//                             "font-bold text-sm",
//                             isFuture ? "text-muted-foreground" : "text-primary"
//                           )}>
//                             {index + 1}
//                           </span>
//                         )}
//                       </div>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2 mb-1">
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <h4 className={cn(
//                                 "font-semibold text-sm",
//                                 isCompleted && "line-through text-muted-foreground"
//                               )}>
//                                 {activity.title}
//                               </h4>
//                               <Badge
//                                 variant="secondary"
//                                 className={cn(
//                                   "text-[10px] py-0.5 px-2 rounded-lg",
//                                   isCompleted
//                                     ? "bg-success/10 text-success"
//                                     : isFuture
//                                       ? "bg-muted text-muted-foreground"
//                                       : "bg-primary/10 text-primary"
//                                 )}
//                               >
//                                 {activity.date}
//                               </Badge>
//                             </div>
//                             <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
//                               <div className="flex items-center gap-1">
//                                 <Clock className="w-3 h-3" />
//                                 <span>{activity.time}</span>
//                               </div>
//                               <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
//                               <div className="flex items-center gap-1">
//                                 <MapPin className="w-3 h-3" />
//                                 <span className="truncate">{activity.location}</span>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Actions */}
//                           {!isCompleted && (
//                             <div className="flex gap-1.5 flex-shrink-0">
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="w-8 h-8 rounded-xl"
//                                 onClick={() => { setActivityDialogMode("edit"); setSelectedActivity(activity); setActivityDialogOpen(true); }}
//                               >
//                                 <Edit className="w-3.5 h-3.5" />
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="w-8 h-8 rounded-xl text-success hover:bg-success/10 hover:text-success"
//                                 onClick={() => handleCompleteActivity(activity.id)}
//                               >
//                                 <CheckCircle className="w-3.5 h-3.5" />
//                               </Button>
//                             </div>
//                           )}
//                         </div>

//                         {/* Tags */}
//                         <div className="flex flex-wrap gap-1.5 mt-2">
//                           <Badge
//                             variant="secondary"
//                             className="text-[10px] py-0.5 px-2 rounded-lg"
//                           >
//                             {activity.type}
//                           </Badge>
//                           <Badge
//                             variant="outline"
//                             className="text-[10px] py-0.5 px-2 rounded-lg"
//                           >
//                             {activity.duration}
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                 );
//               })}

//               {filteredActivities.length === 0 && searchQuery && (
//                 <Card className="p-4 text-center rounded-2xl border-0 shadow-soft">
//                   <Search className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
//                   <p className="text-xs text-muted-foreground">No activities found for "{searchQuery}"</p>
//                   <p className="text-[10px] text-muted-foreground mt-1">Try searching for "Walk", "Fort", or "Food"</p>
//                 </Card>
//               )}
//             </div>
//           </div>

//         </TabsContent>

//           {/* Expense Tracker Tab */}
//           <TabsContent value="expenses" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
//           {/* Budget Overview */}
//           <Card className="p-3 mb-4 rounded-2xl border-0 shadow-soft">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-sm">Trip Budget</h3>
//               <Button size="sm" variant="outline" onClick={() => setExpenseDialogOpen(true)} className="h-8 text-xs rounded-xl px-3">
//                 <Plus className="w-3.5 h-3.5 mr-1" />
//                 Add Expense
//               </Button>
//             </div>

//             <div className="text-center mb-3">
//               <div className="text-2xl font-bold text-primary mb-0.5">₹{totalSpent.toLocaleString()}</div>
//               <div className="text-[10px] text-muted-foreground">
//                 of ₹{totalBudget.toLocaleString()} budget ({Math.round((totalSpent / totalBudget) * 100)}% used)
//               </div>
//               <Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-2" />
//             </div>
//           </Card>

//           {/* Expense Categories */}
//           <div className="space-y-3">
//             {filteredExpenses.map((expense) => {
//               const IconComponent = expense.icon;
//               return (
//                 <Card key={expense.category} className="p-3 rounded-2xl border-0 shadow-soft">
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
//                         <IconComponent className="w-5 h-5 text-primary" />
//                       </div>
//                       <span className="font-semibold text-sm">{expense.category}</span>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-bold text-sm text-primary">₹{expense.amount.toLocaleString()}</div>
//                       <div className="text-[10px] text-muted-foreground">of ₹{expense.budget.toLocaleString()}</div>
//                     </div>
//                   </div>
//                   <Progress value={(expense.amount / expense.budget) * 100} className="h-2" />
//                 </Card>
//               );
//             })}

//             {filteredExpenses.length === 0 && searchQuery && (
//               <Card className="p-4 text-center rounded-2xl border-0 shadow-soft">
//                 <Search className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
//                 <p className="text-xs text-muted-foreground">No expenses found for "{searchQuery}"</p>
//                 <p className="text-[10px] text-muted-foreground mt-1">Try searching for "Food", "Transport", or "Shopping"</p>
//               </Card>
//             )}
//           </div>
//         </TabsContent>

//         </Tabs>
//       </div>

//       <ActivityDialog
//         open={activityDialogOpen}
//         onOpenChange={setActivityDialogOpen}
//         activity={selectedActivity}
//         onSave={handleSaveActivity}
//         mode={activityDialogMode}
//       />

//       <ExpenseDialog
//         open={expenseDialogOpen}
//         onOpenChange={setExpenseDialogOpen}
//         onSave={handleAddExpense}
//         existingCategories={expenses.map(e => e.category)}
//       />
//     </div>
//   );
// };

// export default JourneyPage;

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit,
  CheckCircle,
  User,
  Home,
  UtensilsCrossed,
  Car,
  Ticket,
  ShoppingBag,
  Search,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ActivityDialog, { Activity } from "@/components/dialogs/ActivityDialog";
import ExpenseDialog from "@/components/dialogs/ExpenseDialog";

interface JourneyPageProps {
  onNavigateToAccount?: () => void;
  externalActivities?: { title: string; location: string; type: string }[];
}

// 🕒 Helper function to create dynamic trip data
const getDynamicTripInfo = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 2); // Trip started 2 days ago
  const end = new Date(today);
  end.setDate(today.getDate() + 3); // Trip ends 3 days from now

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const formattedStart = start.toLocaleDateString(undefined, options);
  const formattedEnd = end.toLocaleDateString(undefined, options);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    city: "Delhi",
    duration: `${formattedStart} - ${formattedEnd}`,
    daysLeft,
  };
};

const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToAccount, externalActivities = [] }) => {
  const [activeTab, setActiveTab] = useState("planner");
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [activityDialogMode, setActivityDialogMode] = useState<"add" | "edit">("add");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [addedExternalCount, setAddedExternalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: "Morning Walk at Lodhi Gardens",
      time: "07:00 AM",
      location: "Lodhi Road, Delhi",
      type: "Exercise",
      duration: "1 hour",
      status: "completed",
      date: "Yesterday",
    },
    {
      id: 2,
      title: "Shopping at Connaught Place",
      time: "11:00 AM",
      location: "CP, New Delhi",
      type: "Shopping",
      duration: "2 hours",
      status: "completed",
      date: "Yesterday",
    },
    {
      id: 3,
      title: "Visit Red Fort",
      time: "09:00 AM",
      location: "Chandni Chowk, Delhi",
      type: "Heritage",
      duration: "2 hours",
      status: "planned",
      date: "Today",
    },
    {
      id: 4,
      title: "Street Food at Paranthe Wali Gali",
      time: "12:30 PM",
      location: "Old Delhi",
      type: "Food",
      duration: "1 hour",
      status: "planned",
      date: "Today",
    },
    {
      id: 5,
      title: "Sunset at India Gate",
      time: "06:00 PM",
      location: "Rajpath, New Delhi",
      type: "Scenic",
      duration: "1.5 hours",
      status: "planned",
      date: "Today",
    },
    {
      id: 6,
      title: "Visit Akshardham Temple",
      time: "10:00 AM",
      location: "Akshardham, Delhi",
      type: "Religious",
      duration: "3 hours",
      status: "planned",
      date: "Mar 25",
    },
  ]);

  // Add external activities dynamically
  useEffect(() => {
    if (externalActivities.length > addedExternalCount) {
      const newActivities = externalActivities.slice(addedExternalCount).map((ext, idx) => ({
        id: Date.now() + idx,
        title: ext.title,
        time: "TBD",
        location: ext.location,
        type: ext.type,
        duration: "TBD",
        status: "planned" as const,
        date: "Planned",
      }));
      setActivities((prev) => [...prev, ...newActivities]);
      setAddedExternalCount(externalActivities.length);
    }
  }, [externalActivities, addedExternalCount]);

  const [expenses, setExpenses] = useState([
    { category: "Accommodation", amount: 3500, budget: 5000, icon: Home },
    { category: "Food & Drinks", amount: 2400, budget: 4000, icon: UtensilsCrossed },
    { category: "Transportation", amount: 1200, budget: 2500, icon: Car },
    { category: "Activities", amount: 1800, budget: 3000, icon: Ticket },
    { category: "Shopping", amount: 800, budget: 1500, icon: ShoppingBag },
  ]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);
  const completedCount = activities.filter((a) => a.status === "completed").length;
  const progressPercent = Math.round((completedCount / activities.length) * 100);

  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredExpenses = expenses.filter((expense) =>
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 📝 Add or edit an activity
  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: number }) => {
    if (activityData.id) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activityData.id ? ({ ...activityData, id: a.id } as Activity) : a)),
      );
    } else {
      setActivities((prev) => [...prev, { ...activityData, id: Date.now() } as Activity]);
    }
  };

  // ✅ Complete activity with Undo
  const handleCompleteActivity = (id: number) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: "completed" } : a)));
    toast.success("Activity marked as complete!", {
      action: {
        label: "Undo",
        onClick: () => {
          setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: "planned" } : a)));
          toast.info("Completion undone.");
        },
      },
    });
  };

  // ❌ Delete activity
  const handleDeleteActivity = (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.info("Activity deleted.");
  };

  const handleAddExpense = (expense: { category: string; amount: number }) => {
    setExpenses((prev) =>
      prev.map((e) => (e.category === expense.category ? { ...e, amount: e.amount + expense.amount } : e)),
    );
  };

  const tripInfo = getDynamicTripInfo();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Your Journey
            </h1>
            <p className="text-white/80 text-[10px]">Track, plan, and remember</p>
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
            placeholder="Search activities, expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4 mt-3 h-11 rounded-xl bg-muted">
            <TabsTrigger
              value="planner"
              className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Planner
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Expenses
            </TabsTrigger>
          </TabsList>

          {/* 📍 Planner Tab */}
          <TabsContent value="planner" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            {/* Dynamic Trip Overview */}
            <Card className="p-3 mb-4 bg-gradient-card rounded-2xl border-0 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">Current Trip: {tripInfo.city}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {tripInfo.duration} • {tripInfo.daysLeft} days left
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground text-[10px] py-0.5 px-2 rounded-lg">
                  <Calendar className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>

              <Progress value={progressPercent} className="mb-2 h-2" />
              <p className="text-[10px] text-muted-foreground">{progressPercent}% of activities completed</p>
            </Card>

            {/* Activities Timeline */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Activities Timeline</h2>
                <Button
                  size="sm"
                  className="bg-gradient-primary text-white border-0 h-8 text-xs rounded-xl px-3"
                  onClick={() => {
                    setActivityDialogMode("add");
                    setSelectedActivity(null);
                    setActivityDialogOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Activity
                </Button>
              </div>

              <div className="space-y-3">
                {filteredActivities.map((activity, index) => {
                  const isCompleted = activity.status === "completed";
                  const isFuture = activity.date === "Mar 25";

                  return (
                    <Card
                      key={activity.id}
                      className={cn(
                        "p-3 shadow-soft rounded-2xl border-0 transition-all hover:shadow-medium",
                        isCompleted && "opacity-70",
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Status */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            isCompleted ? "bg-success/20" : isFuture ? "bg-muted" : "bg-primary/10",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <span
                              className={cn("font-bold text-sm", isFuture ? "text-muted-foreground" : "text-primary")}
                            >
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={cn(
                                    "font-semibold text-sm",
                                    isCompleted && "line-through text-muted-foreground",
                                  )}
                                >
                                  {activity.title}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] py-0.5 px-2 rounded-lg",
                                    isCompleted
                                      ? "bg-success/10 text-success"
                                      : isFuture
                                        ? "bg-muted text-muted-foreground"
                                        : "bg-primary/10 text-primary",
                                  )}
                                >
                                  {activity.date}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.time}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{activity.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 flex-shrink-0">
                              {!isCompleted && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-xl"
                                    onClick={() => {
                                      setActivityDialogMode("edit");
                                      setSelectedActivity(activity);
                                      setActivityDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-xl text-success hover:bg-success/10 hover:text-success"
                                    onClick={() => handleCompleteActivity(activity.id)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {activity.type}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {activity.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* 💰 Expenses Tab */}
          <TabsContent value="expenses" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            <Card className="p-3 mb-4 rounded-2xl border-0 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Trip Budget</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpenseDialogOpen(true)}
                  className="h-8 text-xs rounded-xl px-3"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Expense
                </Button>
              </div>

              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-primary mb-0.5">₹{totalSpent.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">
                  of ₹{totalBudget.toLocaleString()} budget ({Math.round((totalSpent / totalBudget) * 100)}% used)
                </div>
                <Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-2" />
              </div>
            </Card>

            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const IconComponent = expense.icon;
                return (
                  <Card key={expense.category} className="p-3 rounded-2xl border-0 shadow-soft">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">{expense.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-primary">₹{expense.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">of ₹{expense.budget.toLocaleString()}</div>
                      </div>
                    </div>
                    <Progress value={(expense.amount / expense.budget) * 100} className="h-2" />
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        activity={selectedActivity}
        onSave={handleSaveActivity}
        mode={activityDialogMode}
      />

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSave={handleAddExpense}
        existingCategories={expenses.map((e) => e.category)}
      />
    </div>
  );
};

export default JourneyPage;
