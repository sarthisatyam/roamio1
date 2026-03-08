import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Receipt, ArrowRight, Wallet, IndianRupee, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { GroupMember } from "./GroupMembersManager";

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  splitAmong: string[]; // member ids
  date: string;
}

interface ExpenseSplitterProps {
  expenses: GroupExpense[];
  onExpensesChange: (expenses: GroupExpense[]) => void;
  members: GroupMember[];
}

const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({ expenses, onExpensesChange, members }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidById: members[0]?.id || "",
    splitAmong: members.map(m => m.id),
  });

  // Calculate balances
  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    members.forEach(m => { balances[m.id] = 0; });

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length;
      // Payer gets credit
      balances[exp.paidById] = (balances[exp.paidById] || 0) + exp.amount;
      // Everyone in split owes their share
      exp.splitAmong.forEach(id => {
        balances[id] = (balances[id] || 0) - share;
      });
    });

    return balances;
  };

  // Calculate simplified settlements
  const calculateSettlements = () => {
    const balances = calculateBalances();
    const settlements: { from: string; to: string; amount: number }[] = [];

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, bal]) => {
      if (bal < -0.01) debtors.push({ id, amount: -bal });
      else if (bal > 0.01) creditors.push({ id, amount: bal });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      if (amount > 0.01) {
        settlements.push({
          from: debtors[i].id,
          to: creditors[j].id,
          amount: Math.round(amount * 100) / 100,
        });
      }
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return settlements;
  };

  const handleAdd = () => {
    if (!form.description.trim() || !form.amount) {
      toast.error("Fill in description and amount");
      return;
    }
    if (form.splitAmong.length === 0) {
      toast.error("Select at least one person to split with");
      return;
    }
    onExpensesChange([...expenses, {
      id: crypto.randomUUID(),
      description: form.description.trim(),
      amount: Number(form.amount),
      paidById: form.paidById,
      splitAmong: form.splitAmong,
      date: new Date().toLocaleDateString(),
    }]);
    setForm({
      description: "",
      amount: "",
      paidById: members[0]?.id || "",
      splitAmong: members.map(m => m.id),
    });
    setDialogOpen(false);
    toast.success("Expense added!");
  };

  const handleDelete = (id: string) => {
    onExpensesChange(expenses.filter(e => e.id !== id));
    toast.info("Expense removed");
  };

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const settlements = calculateSettlements();
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || "Unknown";

  const toggleSplit = (memberId: string) => {
    setForm(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(memberId)
        ? prev.splitAmong.filter(id => id !== memberId)
        : [...prev.splitAmong, memberId],
    }));
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <Card className="p-3 rounded-2xl border-0 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" /> Group Expenses
          </h3>
          <Button
            size="sm"
            className="h-8 text-xs rounded-xl px-3 bg-gradient-primary text-white border-0"
            onClick={() => {
              setForm({
                description: "",
                amount: "",
                paidById: members[0]?.id || "",
                splitAmong: members.map(m => m.id),
              });
              setDialogOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-primary">₹{totalSpent.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground">Total group spending • {expenses.length} expenses</p>
        </div>

        {/* Per-person summary */}
        {members.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {members.map(m => {
              const paid = expenses.filter(e => e.paidById === m.id).reduce((s, e) => s + e.amount, 0);
              const owes = expenses.reduce((s, e) => {
                if (e.splitAmong.includes(m.id)) return s + e.amount / e.splitAmong.length;
                return s;
              }, 0);
              return (
                <div key={m.id} className="bg-muted/50 rounded-xl p-2 text-center">
                  <p className="text-[10px] font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">Paid: ₹{Math.round(paid)}</p>
                  <p className="text-[10px] text-muted-foreground">Share: ₹{Math.round(owes)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card className="p-3 rounded-2xl border-0 shadow-soft">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 text-primary" /> Settle Up
          </h4>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-xl p-2">
                <Badge variant="secondary" className="text-[10px] rounded-lg">{getMemberName(s.from)}</Badge>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <Badge variant="secondary" className="text-[10px] rounded-lg">{getMemberName(s.to)}</Badge>
                <span className="ml-auto font-semibold text-sm text-primary">₹{s.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expense list */}
      {expenses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">📋 All Expenses</h4>
          <div className="space-y-2">
            {expenses.map(exp => (
              <Card key={exp.id} className="p-3 rounded-2xl border-0 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{exp.description}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Paid by <span className="font-medium text-foreground">{getMemberName(exp.paidById)}</span> • {exp.date}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Split among: {exp.splitAmong.map(id => getMemberName(id)).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary">₹{exp.amount}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(exp.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <Card className="p-6 rounded-2xl border-0 shadow-soft text-center">
          <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No group expenses yet</p>
          <p className="text-[10px] text-muted-foreground">Add expenses and split them fairly!</p>
        </Card>
      )}

      {/* Add expense dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add Group Expense
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Description *</Label>
              <Input
                placeholder="e.g., Dinner at restaurant"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="e.g., 2400"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Paid by</Label>
              <Select value={form.paidById} onValueChange={v => setForm({ ...form, paidById: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Split among</Label>
              <div className="space-y-1.5">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.splitAmong.includes(m.id)}
                      onCheckedChange={() => toggleSplit(m.id)}
                    />
                    <span className="text-sm">{m.name}</span>
                    {form.splitAmong.includes(m.id) && form.amount && (
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        ₹{Math.round(Number(form.amount) / form.splitAmong.length)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-gradient-primary text-white">Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseSplitter;
