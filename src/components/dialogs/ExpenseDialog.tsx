// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Plus, Home, UtensilsCrossed, Car, Ticket, ShoppingBag } from "lucide-react";
// import { toast } from "sonner";

// export interface Expense {
//   category: string;
//   amount: number;
//   budget: number;
//   icon: React.ComponentType<{ className?: string }>;
// }

// interface ExpenseDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSave: (expense: { category: string; amount: number; budget: number }) => void;
//   existingCategories: string[];
// }

// const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
//   Accommodation: Home,
//   "Food & Drinks": UtensilsCrossed,
//   Transportation: Car,
//   Activities: Ticket,
//   Shopping: ShoppingBag,
// };

// const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ open, onOpenChange, onSave, existingCategories }) => {
//   const [formData, setFormData] = useState({
//     category: existingCategories[0] || "Accommodation",
//     amount: "",
//   });

//   const handleSubmit = () => {
//     if (!formData.amount || isNaN(Number(formData.amount))) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     onSave({
//       category: formData.category,
//       amount: Number(formData.amount),
//     });

//     toast.success("Expense added successfully!");
//     setFormData({ category: existingCategories[0] || "Accommodation", amount: "" });
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md rounded-2xl">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Plus className="w-5 h-5 text-primary" />
//             Add Expense
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label>Category</Label>
//             <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
//               <SelectTrigger className="rounded-xl">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {existingCategories.map((category) => {
//                   const Icon = categoryIcons[category];
//                   return (
//                     <SelectItem key={category} value={category}>
//                       <div className="flex items-center gap-2">
//                         {Icon && <Icon className="w-4 h-4" />}
//                         {category}
//                       </div>
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="amount">Amount (₹)</Label>
//             <Input
//               id="amount"
//               type="number"
//               placeholder="e.g., 500"
//               value={formData.amount}
//               onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//               className="rounded-xl"
//             />
//           </div>
//         </div>

//         <DialogFooter className="gap-2">
//           <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
//             Add Expense
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ExpenseDialog;

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Home, UtensilsCrossed, Car, Ticket, ShoppingBag, FolderPlus } from "lucide-react";
import { toast } from "sonner";

export interface Expense {
  category: string;
  amount: number;
  budget: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Expense) => void;
  existingCategories: string[];
  expenseToEdit?: Expense | null;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Accommodation: Home,
  "Food & Drinks": UtensilsCrossed,
  Transportation: Car,
  Activities: Ticket,
  Shopping: ShoppingBag,
  Others: FolderPlus,
};

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  existingCategories,
  expenseToEdit,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    budget: "",
    isCustomCategory: false,
  });

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        category: expenseToEdit.category,
        amount: expenseToEdit.amount.toString(),
        budget: expenseToEdit.budget.toString(),
        isCustomCategory: !existingCategories.includes(expenseToEdit.category),
      });
    } else {
      setFormData({
        category: existingCategories[0] || "Accommodation",
        amount: "",
        budget: "",
        isCustomCategory: false,
      });
    }
  }, [expenseToEdit, open, existingCategories]);

  const handleSubmit = () => {
    if (!formData.category || !formData.amount || !formData.budget) {
      toast.error("Please fill in all fields");
      return;
    }

    const parsedAmount = Number(formData.amount);
    const parsedBudget = Number(formData.budget);

    if (isNaN(parsedAmount) || isNaN(parsedBudget)) {
      toast.error("Amount and budget must be numbers");
      return;
    }

    if (parsedAmount > parsedBudget) {
      toast.error("Amount cannot exceed budget");
      return;
    }

    const categoryName = formData.category.trim();
    const icon = categoryIcons[categoryName] || categoryIcons["Others"] || FolderPlus;

    onSave({
      category: categoryName,
      amount: parsedAmount,
      budget: parsedBudget,
      icon,
    });

    toast.success(expenseToEdit ? "Expense updated!" : "Expense added!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            {expenseToEdit ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            {!formData.isCustomCategory ? (
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  if (value === "Others") {
                    setFormData({ ...formData, category: "", isCustomCategory: true });
                  } else {
                    setFormData({ ...formData, category: value });
                  }
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((category) => {
                    const Icon = categoryIcons[category];
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-4 h-4" />}
                          {category}
                        </div>
                      </SelectItem>
                    );
                  })}
                  <SelectItem value="Others">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4" />
                      Others
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter new category name"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="rounded-xl"
              />
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 1200"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="rounded-xl"
            />
          </div>

          {/* Budget Input */}
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 3000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
            {expenseToEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
