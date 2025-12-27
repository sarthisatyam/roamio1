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
//   onSave: (expense: { category: string; amount: number }) => void;
//   existingCategories: string[];
// }

// const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
//   "Accommodation": Home,
//   "Food & Drinks": UtensilsCrossed,
//   "Transportation": Car,
//   "Activities": Ticket,
//   "Shopping": ShoppingBag
// };

// const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
//   open,
//   onOpenChange,
//   onSave,
//   existingCategories
// }) => {
//   const [formData, setFormData] = useState({
//     category: existingCategories[0] || "Accommodation",
//     amount: ""
//   });

//   const handleSubmit = () => {
//     if (!formData.amount || isNaN(Number(formData.amount))) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     onSave({
//       category: formData.category,
//       amount: Number(formData.amount)
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
//             <Select
//               value={formData.category}
//               onValueChange={(value) => setFormData({ ...formData, category: value })}
//             >
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: { category: string; amount: number; budget: number }) => void;
  expense?: any;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ open, onOpenChange, onSave, expense }) => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (expense) {
      setCategory(expense.category);
      setAmount(expense.amount.toString());
      setBudget(expense.budget.toString());
    } else {
      setCategory("");
      setAmount("");
      setBudget("");
    }
  }, [expense, open]);

  const handleSubmit = () => {
    if (!category || !amount || !budget) {
      toast.error("Please fill in all fields");
      return;
    }

    const parsedAmount = Number(amount);
    const parsedBudget = Number(budget);

    if (isNaN(parsedAmount) || isNaN(parsedBudget)) {
      toast.error("Amount and budget must be numbers");
      return;
    }

    if (parsedAmount > parsedBudget) {
      toast.error("Amount cannot exceed budget");
      return;
    }

    onSave({
      category: category.trim(),
      amount: parsedAmount,
      budget: parsedBudget,
    });

    toast.success(expense ? "Expense updated!" : "Expense added!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Food & Drinks or Others"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-[10px] text-muted-foreground">
              Type a new category name if it's not listed (e.g., “Others”)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Spent</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 3000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
            {expense ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
