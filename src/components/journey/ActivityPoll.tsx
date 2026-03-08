import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThumbsUp, ThumbsDown, Vote, Plus, Trophy, Clock, MapPin, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GroupMember } from "./GroupMembersManager";

export interface PollActivity {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  proposedBy: string;
  votes: Record<string, "up" | "down">; // memberId -> vote
  resolved: boolean;
  accepted?: boolean;
}

interface ActivityPollProps {
  polls: PollActivity[];
  onPollsChange: (polls: PollActivity[]) => void;
  members: GroupMember[];
  currentVoter: string; // current member id who is voting
  onCurrentVoterChange: (id: string) => void;
}

const ActivityPoll: React.FC<ActivityPollProps> = ({
  polls, onPollsChange, members, currentVoter, onCurrentVoterChange
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", time: "" });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handlePropose = () => {
    if (!form.title.trim()) { toast.error("Enter activity title"); return; }
    const proposer = members.find(m => m.id === currentVoter);
    onPollsChange([...polls, {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      location: form.location.trim(),
      date: selectedDate ? format(selectedDate, "PPP") : "",
      time: form.time.trim(),
      proposedBy: proposer?.name || "Unknown",
      votes: { [currentVoter]: "up" },
      resolved: false,
    }]);
    setForm({ title: "", location: "", time: "" });
    setSelectedDate(undefined);
    setDialogOpen(false);
    toast.success("Activity proposed for voting!");
  };

  const handleVote = (pollId: string, vote: "up" | "down") => {
    onPollsChange(polls.map(p => {
      if (p.id !== pollId || p.resolved) return p;
      const newVotes = { ...p.votes, [currentVoter]: vote };
      return { ...p, votes: newVotes };
    }));
  };

  const handleResolve = (pollId: string) => {
    onPollsChange(polls.map(p => {
      if (p.id !== pollId) return p;
      const ups = Object.values(p.votes).filter(v => v === "up").length;
      const downs = Object.values(p.votes).filter(v => v === "down").length;
      return { ...p, resolved: true, accepted: ups >= downs };
    }));
    toast.success("Poll resolved!");
  };

  const currentMember = members.find(m => m.id === currentVoter);
  const unresolvedPolls = polls.filter(p => !p.resolved);
  const resolvedPolls = polls.filter(p => p.resolved);

  return (
    <div className="space-y-3">
      {/* Voter selector */}
      <Card className="p-3 rounded-2xl border-0 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Voting as:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {members.map(m => (
              <Button
                key={m.id}
                size="sm"
                variant={m.id === currentVoter ? "default" : "outline"}
                className={`h-6 text-[10px] rounded-lg px-2 ${m.id === currentVoter ? "bg-gradient-primary text-white" : ""}`}
                onClick={() => onCurrentVoterChange(m.id)}
              >
                {m.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Propose button */}
      <Button
        className="w-full bg-gradient-primary text-white border-0 rounded-xl h-9 text-xs"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Propose an Activity
      </Button>

      {/* Active polls */}
      {unresolvedPolls.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">🗳️ Open Polls</h4>
          <div className="space-y-2">
            {unresolvedPolls.map(poll => {
              const ups = Object.values(poll.votes).filter(v => v === "up").length;
              const downs = Object.values(poll.votes).filter(v => v === "down").length;
              const myVote = poll.votes[currentVoter];
              const allVoted = members.every(m => poll.votes[m.id]);

              return (
                <Card key={poll.id} className="p-3 rounded-2xl border-0 shadow-soft">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{poll.title}</h4>
                      {poll.location && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" /> {poll.location}
                        </div>
                      )}
                      {poll.date && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <CalendarIcon className="w-3 h-3" /> {poll.date}
                        </div>
                      )}
                      {poll.time && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" /> {poll.time}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Proposed by <span className="font-medium text-foreground">{poll.proposedBy}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={myVote === "up" ? "default" : "outline"}
                        className={`h-7 text-[10px] rounded-lg px-3 gap-1 ${myVote === "up" ? "bg-success text-white hover:bg-success/90" : ""}`}
                        onClick={() => handleVote(poll.id, "up")}
                      >
                        <ThumbsUp className="w-3 h-3" /> {ups}
                      </Button>
                      <Button
                        size="sm"
                        variant={myVote === "down" ? "default" : "outline"}
                        className={`h-7 text-[10px] rounded-lg px-3 gap-1 ${myVote === "down" ? "bg-destructive text-white hover:bg-destructive/90" : ""}`}
                        onClick={() => handleVote(poll.id, "down")}
                      >
                        <ThumbsDown className="w-3 h-3" /> {downs}
                      </Button>
                    </div>

                    {allVoted && (
                      <Button
                        size="sm"
                        className="h-7 text-[10px] rounded-lg px-3 bg-gradient-primary text-white"
                        onClick={() => handleResolve(poll.id)}
                      >
                        Finalize
                      </Button>
                    )}
                    {!allVoted && (
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="w-3 h-3 mr-1" /> {Object.keys(poll.votes).length}/{members.length} voted
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved polls */}
      {resolvedPolls.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">✅ Decided</h4>
          <div className="space-y-2">
            {resolvedPolls.map(poll => (
              <Card key={poll.id} className={`p-3 rounded-2xl border-0 shadow-soft ${poll.accepted ? "bg-success/5" : "bg-destructive/5 opacity-60"}`}>
                <div className="flex items-center gap-2">
                  {poll.accepted ? (
                    <Trophy className="w-4 h-4 text-success" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-destructive" />
                  )}
                  <div>
                    <h4 className={`font-semibold text-sm ${!poll.accepted && "line-through"}`}>{poll.title}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {poll.accepted ? "Approved" : "Rejected"} • {Object.values(poll.votes).filter(v => v === "up").length} yes / {Object.values(poll.votes).filter(v => v === "down").length} no
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {polls.length === 0 && (
        <Card className="p-6 rounded-2xl border-0 shadow-soft text-center">
          <Vote className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No activities proposed yet</p>
          <p className="text-[10px] text-muted-foreground">Propose places and let the group vote!</p>
        </Card>
      )}

      {/* Propose dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Propose Activity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Activity *</Label>
              <Input
                placeholder="e.g., Visit Taj Mahal"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Location</Label>
              <Input
                placeholder="e.g., Agra"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP (EEEE)") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Proposing as <span className="font-medium">{currentMember?.name}</span>. Your upvote will be auto-added.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePropose} className="bg-gradient-primary text-white">Propose</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityPoll;
