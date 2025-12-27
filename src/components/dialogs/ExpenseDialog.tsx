import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Home, UtensilsCrossed, Car, Ticket, ShoppingBag } from "lucide-react";
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
  onSave: (expense: { category: string; amount: number }) => void;
  existingCategories: string[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Accommodation: Home,
  "Food & Drinks": UtensilsCrossed,
  Transportation: Car,
  Activities: Ticket,
  Shopping: ShoppingBag,
};

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ open, onOpenChange, onSave, existingCategories }) => {
  const [formData, setFormData] = useState({
    category: existingCategories[0] || "Accommodation",
    amount: "",
  });

  const handleSubmit = () => {
    if (!formData.amount || isNaN(Number(formData.amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    onSave({
      category: formData.category,
      amount: Number(formData.amount),
    });

    toast.success("Expense added successfully!");
    setFormData({ category: existingCategories[0] || "Accommodation", amount: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary text-white border-0 rounded-xl">
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
