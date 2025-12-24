import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit,
  CheckCircle,
  Camera,
  User,
  Home,
  UtensilsCrossed,
  Car,
  Ticket,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ActivityDialog, { Activity } from "@/components/dialogs/ActivityDialog";
import ExpenseDialog from "@/components/dialogs/ExpenseDialog";

interface JourneyPageProps {
  onNavigateToAccount?: () => void;
  externalActivities?: { title: string; location: string; type: string }[];
}

const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToAccount, externalActivities = [] }) => {
  const [activeTab, setActiveTab] = useState("planner");
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [activityDialogMode, setActivityDialogMode] = useState<"add" | "edit">("add");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [addedExternalCount, setAddedExternalCount] = useState(0);

  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, title: "Morning Walk at Lodhi Gardens", time: "07:00 AM", location: "Lodhi Road, Delhi", type: "Exercise", duration: "1 hour", status: "completed", date: "Yesterday" },
    { id: 2, title: "Shopping at Connaught Place", time: "11:00 AM", location: "CP, New Delhi", type: "Shopping", duration: "2 hours", status: "completed", date: "Yesterday" },
    { id: 3, title: "Visit Red Fort", time: "09:00 AM", location: "Chandni Chowk, Delhi", type: "Heritage", duration: "2 hours", status: "planned", date: "Today" },
    { id: 4, title: "Street Food at Paranthe Wali Gali", time: "12:30 PM", location: "Old Delhi", type: "Food", duration: "1 hour", status: "planned", date: "Today" },
    { id: 5, title: "Sunset at India Gate", time: "06:00 PM", location: "Rajpath, New Delhi", type: "Scenic", duration: "1.5 hours", status: "planned", date: "Today" },
    { id: 6, title: "Visit Akshardham Temple", time: "10:00 AM", location: "Akshardham, Delhi", type: "Religious", duration: "3 hours", status: "planned", date: "Mar 25" }
  ]);

  // Add external activities when they change
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
        date: "Planned"
      }));
      setActivities(prev => [...prev, ...newActivities]);
      setAddedExternalCount(externalActivities.length);
    }
  }, [externalActivities, addedExternalCount]);

  const [expenses, setExpenses] = useState([
    { category: "Accommodation", amount: 3500, budget: 5000, icon: Home },
    { category: "Food & Drinks", amount: 2400, budget: 4000, icon: UtensilsCrossed },
    { category: "Transportation", amount: 1200, budget: 2500, icon: Car },
    { category: "Activities", amount: 1800, budget: 3000, icon: Ticket },
    { category: "Shopping", amount: 800, budget: 1500, icon: ShoppingBag }
  ]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);
  const completedCount = activities.filter(a => a.status === "completed").length;
  const progressPercent = Math.round((completedCount / activities.length) * 100);

  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: number }) => {
    if (activityData.id) {
      setActivities(prev => prev.map(a => a.id === activityData.id ? { ...activityData, id: a.id } as Activity : a));
    } else {
      setActivities(prev => [...prev, { ...activityData, id: Date.now() } as Activity]);
    }
  };

  const handleCompleteActivity = (id: number) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: "completed" as const } : a));
    toast.success("Activity marked as complete!");
  };

  const handleAddExpense = (expense: { category: string; amount: number }) => {
    setExpenses(prev => prev.map(e => e.category === expense.category ? { ...e, amount: e.amount + expense.amount } : e));
  };


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
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4 mt-3 h-11 rounded-xl">
            <TabsTrigger value="planner" className="text-xs rounded-lg flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Planner
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs rounded-lg flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              Expenses
            </TabsTrigger>
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
            
            <Progress value={progressPercent} className="mb-3" />
            <p className="text-sm text-muted-foreground">{progressPercent}% of activities completed</p>
          </Card>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Activities Timeline</h2>
              <Button 
                size="sm" 
                className="bg-gradient-primary text-white border-0"
                onClick={() => { setActivityDialogMode("add"); setSelectedActivity(null); setActivityDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            <div className="space-y-3">
              {activities.map((activity, index) => {
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { setActivityDialogMode("edit"); setSelectedActivity(activity); setActivityDialogOpen(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCompleteActivity(activity.id)}
                          >
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
          <div className="flex justify-center">
            <Button variant="outline" className="h-20 w-full max-w-xs flex flex-col gap-2">
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
              <Button size="sm" variant="outline" onClick={() => setExpenseDialogOpen(true)}>
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

        </Tabs>
      </div>

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
        existingCategories={expenses.map(e => e.category)}
      />
    </div>
  );
};

export default JourneyPage;