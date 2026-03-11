import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon, MapPin, Users, Shield, Upload, Eye, EyeOff, Sparkles,
  Mountain, Waves, Tent, Music, Sun, Compass, Car, PartyPopper, Droplets,
  Coffee, Zap, Calendar as CalIcon, CheckCircle, XCircle, Clock, Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plan, JoinRequest } from "@/hooks/usePlans";

const INTERESTS = [
  { label: "Road Trip", icon: Car },
  { label: "Weekend Trip", icon: CalIcon },
  { label: "Beach", icon: Waves },
  { label: "Mountains", icon: Mountain },
  { label: "Nightlife", icon: Music },
  { label: "Nature", icon: Sun },
  { label: "Backpacking", icon: Compass },
  { label: "Camping", icon: Tent },
  { label: "Concert", icon: Music },
  { label: "Water Sports", icon: Droplets },
  { label: "Hangout", icon: Coffee },
  { label: "Day Trip", icon: Zap },
  { label: "Events", icon: PartyPopper },
];

interface PlanOwnerDialogProps {
  plan: Plan | null;
  onClose: () => void;
  onUpdated: () => void;
  getPendingRequests: (planId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (requestId: string, action: "approved" | "rejected", planId: string, requestUserId: string) => Promise<void>;
}

const PlanOwnerDialog: React.FC<PlanOwnerDialogProps> = ({
  plan, onClose, onUpdated, getPendingRequests, handleJoinRequest,
}) => {
  // Edit state
  const [planName, setPlanName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxMembers, setMaxMembers] = useState(6);
  const [groupType, setGroupType] = useState("everyone");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [interests, setInterests] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Requests state
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Init form from plan
  useEffect(() => {
    if (!plan) return;
    setPlanName(plan.plan_name);
    setDestination(plan.destination_name);
    setStartDate(new Date(plan.start_date));
    setEndDate(new Date(plan.end_date));
    setMaxMembers(plan.max_members);
    setGroupType(plan.group_type);
    setDescription(plan.trip_description || "");
    setVisibility(plan.plan_visibility);
    setInterests(plan.interests || []);
    setCoverPreview(plan.cover_image_url || null);
    setCoverFile(null);
    loadRequests(plan.id);
  }, [plan]);

  const loadRequests = async (planId: string) => {
    setLoadingRequests(true);
    try {
      const reqs = await getPendingRequests(planId);
      setPendingRequests(reqs);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleInterest = (label: string) => {
    setInterests(prev => {
      if (prev.includes(label)) return prev.filter(i => i !== label);
      if (prev.length >= 5) { toast.error("Max 5 interests"); return prev; }
      return [...prev, label];
    });
  };

  const handleSave = async () => {
    if (!plan || !startDate || !endDate) return;
    if (!planName.trim() || !destination.trim() || interests.length < 3) {
      toast.error("Fill all required fields (name, destination, 3+ interests)");
      return;
    }
    setIsSaving(true);
    try {
      let coverUrl = plan.cover_image_url;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fileName = `${plan.creator_id}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("trip-covers")
          .upload(fileName, coverFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("trip-covers").getPublicUrl(fileName);
        coverUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("plans")
        .update({
          plan_name: planName.trim(),
          destination_name: destination.trim(),
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          max_members: maxMembers,
          group_type: groupType,
          plan_visibility: visibility,
          trip_description: description.trim() || null,
          cover_image_url: coverUrl,
          interests,
        } as any)
        .eq("id", plan.id);

      if (error) throw error;
      toast.success("Plan updated! ✅");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    } finally {
      setIsSaving(false);
    }
  };

  const onReview = async (req: JoinRequest, action: "approved" | "rejected") => {
    try {
      await handleJoinRequest(req.id, action, req.plan_id, req.user_id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success(action === "approved" ? "Approved! ✅" : "Rejected.");
    } catch {
      toast.error("Failed to process request");
    }
  };

  return (
    <Dialog open={!!plan} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Manage Plan</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-5 mb-2">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">
              Requests{pendingRequests.length > 0 && ` (${pendingRequests.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto px-5 pb-5 space-y-5 mt-0">
            {/* Plan Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Plan Name *</Label>
              <Input value={planName} onChange={e => setPlanName(e.target.value)} className="h-10" maxLength={100} />
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Destination *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={destination} onChange={e => setDestination(e.target.value)} className="h-10 pl-9" />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start h-10 text-xs", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {startDate ? format(startDate, "MMM dd") : "Pick"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start h-10 text-xs", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {endDate ? format(endDate, "MMM dd") : "Pick"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={d => d < (startDate || new Date())} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Group Size */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Group Size: <span className="text-primary">{maxMembers}</span></Label>
              <Slider value={[maxMembers]} onValueChange={v => setMaxMembers(v[0])} min={2} max={20} step={1} />
            </div>

            {/* Group Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Group Type</Label>
              <div className="flex gap-2">
                {[
                  { value: "everyone", label: "Everyone", icon: Users },
                  { value: "males_only", label: "Males", icon: Shield },
                  { value: "females_only", label: "Females", icon: Shield },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGroupType(opt.value)}
                    className={cn(
                      "flex-1 p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all text-center",
                      groupType === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                    )}
                  >
                    <opt.icon className={cn("w-3.5 h-3.5", groupType === opt.value ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Visibility</Label>
              <div className="flex gap-2">
                {[
                  { value: "public", label: "Public", icon: Eye },
                  { value: "private", label: "Private", icon: EyeOff },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={cn(
                      "flex-1 p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all",
                      visibility === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                    )}
                  >
                    <opt.icon className={cn("w-3.5 h-3.5", visibility === opt.value ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Interests * <span className="text-muted-foreground font-normal">(3–5)</span></Label>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map(item => {
                  const selected = interests.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      onClick={() => toggleInterest(item.label)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 transition-all text-[10px] font-medium",
                        selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-[80px]" maxLength={1000} />
            </div>

            {/* Cover */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cover Photo</Label>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden aspect-video">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <Button variant="secondary" size="sm" className="absolute bottom-2 right-2 text-xs" onClick={() => { setCoverFile(null); setCoverPreview(plan?.cover_image_url || null); }}>
                    Reset
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2 transition-colors bg-muted/30"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload cover</span>
                </button>
              )}
            </div>

            {/* Save */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl bg-gradient-primary">
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="flex-1 overflow-y-auto px-5 pb-5 space-y-3 mt-0">
            {loadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <Card key={req.id} className="p-3 rounded-xl border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{req.sender_name || "Traveler"}</p>
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">"{req.message}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(req.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 rounded-lg border-green-500/30 text-green-600 hover:bg-green-500/10"
                        onClick={() => onReview(req, "approved")}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => onReview(req, "rejected")}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PlanOwnerDialog;
