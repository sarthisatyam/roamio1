import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, X, Users, Search, Send, CheckCircle, Loader2, Bell, Check, XCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SearchedUser, JourneyInvite } from "@/hooks/useJourneyInvites";

export interface GroupMember {
  id: string;
  name: string;
  user_id?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface GroupMembersManagerProps {
  members: GroupMember[];
  onMembersChange?: (members: GroupMember[]) => void;
  onSearchUsers?: (query: string) => Promise<SearchedUser[]>;
  onSendInvite?: (toUserId: string, message?: string) => Promise<void>;
  onRespondToInvite?: (inviteId: string, status: "accepted" | "declined") => Promise<void>;
  getInviteStatus?: (userId: string) => string;
  pendingInvites?: JourneyInvite[];
}

const COLORS = [
  "bg-primary/20 text-primary",
  "bg-accent/20 text-accent-foreground",
  "bg-destructive/10 text-destructive",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
];

const GroupMembersManager: React.FC<GroupMembersManagerProps> = ({
  members,
  onMembersChange,
  onSearchUsers,
  onSendInvite,
  onRespondToInvite,
  getInviteStatus,
  pendingInvites = [],
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invitesDialogOpen, setInvitesDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !onSearchUsers) return;
    setIsSearching(true);
    try {
      const results = await onSearchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) toast.info("No users found");
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async (user: SearchedUser) => {
    if (!onSendInvite) return;
    setSendingTo(user.user_id);
    try {
      await onSendInvite(user.user_id);
      toast.success(`Invite sent to ${user.display_name || "user"}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invite");
    } finally {
      setSendingTo(null);
    }
  };

  const handleRespond = async (inviteId: string, status: "accepted" | "declined", fromName?: string) => {
    if (!onRespondToInvite) return;
    setRespondingTo(inviteId);
    try {
      await onRespondToInvite(inviteId, status);
      toast.success(status === "accepted" ? `${fromName || "User"} added to group!` : "Invite declined");
    } catch {
      toast.error("Failed to respond");
    } finally {
      setRespondingTo(null);
    }
  };

  const handleRemove = (id: string) => {
    if (!onMembersChange) return;
    if (members.length <= 1) { toast.error("Need at least one member"); return; }
    onMembersChange(members.filter(m => m.id !== id));
  };

  const canManageMembers = !!onMembersChange;

  return (
    <>
      <Card className="p-3 mb-4 rounded-2xl border-0 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Group Members</h3>
            <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
          </div>
          <div className="flex gap-1.5">
            {canManageMembers && pendingInvites.length > 0 && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-xl relative" onClick={() => setInvitesDialogOpen(true)}>
                <Bell className="w-3 h-3 mr-1" /> Invites
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {pendingInvites.length}
                </span>
              </Button>
            )}
            {canManageMembers && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-xl" onClick={() => { setDialogOpen(true); setSearchQuery(""); setSearchResults([]); }}>
                <UserPlus className="w-3 h-3 mr-1" /> Add
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-xs py-1 px-3 rounded-xl gap-1.5 ${COLORS[i % COLORS.length]}`}>
                {m.avatar_url ? (
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={m.avatar_url} />
                    <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                  </Avatar>
                ) : null}
                <span className="relative">
                  {m.name}
                  {m.is_online && (
                    <span className="absolute -top-0.5 -right-2.5 w-1.5 h-1.5 bg-success rounded-full" />
                  )}
                </span>
                {members.length > 1 && m.id !== "me" && (
                  <button onClick={() => handleRemove(m.id)} className="ml-0.5 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Search & Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Search Roamio Users
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="rounded-xl flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching} size="sm" className="rounded-xl bg-gradient-primary text-white h-10 px-3">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 mt-2 min-h-0">
            {searchResults.length === 0 && !isSearching && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Search for Roamio users by name or city
              </p>
            )}
            {searchResults.map(user => {
              const status = getInviteStatus?.(user.user_id) || "none";
              const isMember = members.some(m => m.user_id === user.user_id);
              const isSending = sendingTo === user.user_id;

              return (
                <Card key={user.user_id} className="p-3 rounded-xl border-0 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {(user.display_name || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">{user.display_name || "Anonymous"}</span>
                        {user.is_verified && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
                      </div>
                      {user.city && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {user.city}
                        </p>
                      )}
                    </div>
                    <div>
                      {isMember ? (
                        <Badge variant="secondary" className="text-[9px]">In Group</Badge>
                      ) : status === "pending" ? (
                        <Badge variant="outline" className="text-[9px] text-warning">Pending</Badge>
                      ) : status === "accepted" ? (
                        <Badge variant="secondary" className="text-[9px] text-success">Accepted</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] rounded-xl gap-1"
                          onClick={() => handleSendInvite(user)}
                          disabled={isSending}
                        >
                          {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Invites Dialog */}
      <Dialog open={invitesDialogOpen} onOpenChange={setInvitesDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[70vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Journey Invites
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {pendingInvites.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No pending invites</p>
            ) : (
              pendingInvites.map(invite => {
                const name = invite.from_profile?.display_name || "Someone";
                const isResponding = respondingTo === invite.id;
                return (
                  <Card key={invite.id} className="p-3 rounded-xl border-0 shadow-soft">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={invite.from_profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{name}</p>
                        {invite.from_profile?.city && (
                          <p className="text-[10px] text-muted-foreground">{invite.from_profile.city}</p>
                        )}
                        {invite.message && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 italic">"{invite.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-7 h-7 rounded-lg text-success hover:bg-success/10"
                          onClick={() => handleRespond(invite.id, "accepted", name)}
                          disabled={isResponding}
                        >
                          {isResponding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleRespond(invite.id, "declined", name)}
                          disabled={isResponding}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvitesDialogOpen(false)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupMembersManager;
