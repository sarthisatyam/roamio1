// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Plus, Edit, Calendar } from "lucide-react";
// import { toast } from "sonner";

// export interface Activity {
//   id: number;
//   title: string;
//   time: string;
//   location: string;
//   type: string;
//   duration: string;
//   status: "planned" | "completed";
//   date: string;
// }

// interface ActivityDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   activity?: Activity | null;
//   onSave: (activity: Omit<Activity, "id"> & { id?: number }) => void;
//   mode: "add" | "edit";
// }

// const activityTypes = ["Exercise", "Shopping", "Heritage", "Food", "Scenic", "Religious", "Entertainment", "Adventure"];

// const ActivityDialog: React.FC<ActivityDialogProps> = ({ open, onOpenChange, activity, onSave, mode }) => {
//   const [formData, setFormData] = useState<{
//     title: string;
//     time: string;
//     location: string;
//     type: string;
//     duration: string;
//     date: string;
//     status: "planned" | "completed";
//   }>({
//     title: "",
//     time: "",
//     location: "",
//     type: "Heritage",
//     duration: "",
//     date: new Date().toISOString().split("T")[0], // default to today’s date
//     status: "planned",
//   });

//   useEffect(() => {
//     if (activity && mode === "edit") {
//       setFormData({
//         title: activity.title,
//         time: activity.time,
//         location: activity.location,
//         type: activity.type,
//         duration: activity.duration,
//         date: activity.date.length <= 10 ? activity.date : new Date().toISOString().split("T")[0],
//         status: activity.status,
//       });
//     } else {
//       setFormData({
//         title: "",
//         time: "",
//         location: "",
//         type: "Heritage",
//         duration: "",
//         date: new Date().toISOString().split("T")[0],
//         status: "planned",
//       });
//     }
//   }, [activity, mode, open]);

//   const handleSubmit = () => {
//     if (!formData.title || !formData.time || !formData.location) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     onSave({
//       ...formData,
//       id: activity?.id,
//     });

//     toast.success(mode === "add" ? "Activity added successfully!" : "Activity updated successfully!");
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md rounded-2xl">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             {mode === "add" ? (
//               <>
//                 <Plus className="w-5 h-5 text-primary" />
//                 Add Activity
//               </>
//             ) : (
//               <>
//                 <Edit className="w-5 h-5 text-primary" />
//                 Edit Activity
//               </>
//             )}
//           </DialogTitle>
//         </DialogHeader>

//         {/* 🧭 Form */}
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="title">Activity Title *</Label>
//             <Input
//               id="title"
//               placeholder="e.g., Visit Red Fort"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               className="rounded-xl"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-2">
//               <Label htmlFor="time">Time *</Label>
//               <Input
//                 id="time"
//                 placeholder="e.g., 09:00 AM"
//                 value={formData.time}
//                 onChange={(e) => setFormData({ ...formData, time: e.target.value })}
//                 className="rounded-xl"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="duration">Duration</Label>
//               <Input
//                 id="duration"
//                 placeholder="e.g., 2 hours"
//                 value={formData.duration}
//                 onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
//                 className="rounded-xl"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="location">Location *</Label>
//             <Input
//               id="location"
//               placeholder="e.g., Chandni Chowk, Delhi"
//               value={formData.location}
//               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//               className="rounded-xl"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-2">
//               <Label>Type</Label>
//               <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
//                 <SelectTrigger className="rounded-xl">
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {activityTypes.map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* 📅 Calendar Date Picker */}
//             <div className="space-y-2">
//               <Label htmlFor="date">Date</Label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                 <Input
//                   id="date"
//                   type="date"
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="pl-10 rounded-xl"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="gap-2">
//           <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
//             {mode === "add" ? "Add Activity" : "Save Changes"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ActivityDialog;

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface Activity {
  id: number;
  title: string;
  time: string;
  location: string;
  type: string;
  duration: string;
  status: "planned" | "completed";
  date: string;
}

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  onSave: (activity: Omit<Activity, "id"> & { id?: number }) => void;
  onDelete?: (id: number) => void; // 🆕 delete callback
  mode: "add" | "edit";
}

const activityTypes = ["Exercise", "Shopping", "Heritage", "Food", "Scenic", "Religious", "Entertainment", "Adventure"];

const ActivityDialog: React.FC<ActivityDialogProps> = ({ open, onOpenChange, activity, onSave, onDelete, mode }) => {
  const [formData, setFormData] = useState<{
    title: string;
    time: string;
    location: string;
    type: string;
    duration: string;
    date: string;
    status: "planned" | "completed";
  }>({
    title: "",
    time: "",
    location: "",
    type: "Heritage",
    duration: "",
    date: new Date().toISOString().split("T")[0],
    status: "planned",
  });

  useEffect(() => {
    if (activity && mode === "edit") {
      setFormData({
        title: activity.title,
        time: activity.time,
        location: activity.location,
        type: activity.type,
        duration: activity.duration,
        date: activity.date.length <= 10 ? activity.date : new Date().toISOString().split("T")[0],
        status: activity.status,
      });
    } else {
      setFormData({
        title: "",
        time: "",
        location: "",
        type: "Heritage",
        duration: "",
        date: new Date().toISOString().split("T")[0],
        status: "planned",
      });
    }
  }, [activity, mode, open]);

  const handleSubmit = () => {
    if (!formData.title || !formData.time || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave({
      ...formData,
      id: activity?.id,
    });

    toast.success(mode === "add" ? "Activity added successfully!" : "Activity updated successfully!");
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (mode === "add") {
      // 🟥 If adding, just close dialog (cancel creation)
      toast.info("Activity creation canceled");
      onOpenChange(false);
      return;
    }

    // 🗑️ If editing, delete the activity
    if (activity && onDelete) {
      onDelete(activity.id);
      toast.success("Activity deleted successfully!");
      onOpenChange(false);
    } else {
      toast.error("Unable to delete activity");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "add" ? (
              <>
                <Plus className="w-5 h-5 text-primary" />
                Add Activity
              </>
            ) : (
              <>
                <Edit className="w-5 h-5 text-primary" />
                Edit Activity
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 🧭 Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Visit Red Fort"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                placeholder="e.g., 09:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 2 hours"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Chandni Chowk, Delhi"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 📅 Calendar Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🦾 Footer Buttons */}
        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
            {mode === "add" ? "Add Activity" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDialog;
