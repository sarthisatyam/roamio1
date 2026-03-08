import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, X, Users } from "lucide-react";
import { toast } from "sonner";

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
}

interface GroupMembersManagerProps {
  members: GroupMember[];
  onMembersChange: (members: GroupMember[]) => void;
}

const COLORS = [
  "bg-primary/20 text-primary",
  "bg-accent/20 text-accent-foreground",
  "bg-destructive/10 text-destructive",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
];

const GroupMembersManager: React.FC<GroupMembersManagerProps> = ({ members, onMembersChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { toast.error("Enter a name"); return; }
    if (members.find(m => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Member already exists");
      return;
    }
    onMembersChange([...members, { id: crypto.randomUUID(), name }]);
    setNewName("");
    toast.success(`${name} added to group`);
  };

  const handleRemove = (id: string) => {
    if (members.length <= 1) { toast.error("Need at least one member"); return; }
    onMembersChange(members.filter(m => m.id !== id));
  };

  return (
    <>
      <Card className="p-3 mb-4 rounded-2xl border-0 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Group Members</h3>
            <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-xl" onClick={() => setDialogOpen(true)}>
            <UserPlus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => (
            <Badge key={m.id} variant="secondary" className={`text-xs py-1 px-3 rounded-xl gap-1 ${COLORS[i % COLORS.length]}`}>
              {m.name}
              {members.length > 1 && (
                <button onClick={() => handleRemove(m.id)} className="ml-1 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Group Member</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Member name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-gradient-primary text-white">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupMembersManager;
