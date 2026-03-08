import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft, CalendarIcon, MapPin, Users, Shield, Upload,
  Eye, EyeOff, Sparkles, Check, Mountain, Waves, Tent, Music, Sun,
  Compass, Car, PartyPopper, Droplets, Coffee, Zap, Calendar as CalIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlanBuilderProps {
  currentUserId: string;
  userGender?: string | null;
  onComplete: () => void;
  onClose: () => void;
}

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

const PlanBuilder: React.FC<PlanBuilderProps> = ({ currentUserId, userGender, onComplete, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [planName, setPlanName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [maxMembers, setMaxMembers] = useState(6);
  const [groupType, setGroupType] = useState("everyone");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [interests, setInterests] = useState<string[]>([]);

  const canSubmit = 
    planName.trim().length > 0 &&
    destination.trim().length > 0 &&
    startDate && endDate && endDate >= startDate &&
    maxMembers >= 2 &&
    !!groupType &&
    !!visibility &&
    interests.length >= 3;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
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

  const handleSubmit = async () => {
    if (!startDate || !endDate || !canSubmit) return;
    setIsSubmitting(true);
    try {
      let coverUrl: string | undefined;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fileName = `${currentUserId}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("trip-covers")
          .upload(fileName, coverFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("trip-covers").getPublicUrl(fileName);
        coverUrl = urlData.publicUrl;
      }

      const { data: plan, error } = await supabase
        .from("plans")
        .insert({
          creator_id: currentUserId,
          plan_name: planName.trim(),
          destination_name: destination.trim(),
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          max_members: maxMembers,
          group_type: groupType,
          plan_visibility: visibility,
          trip_description: description.trim() || null,
          cover_image_url: coverUrl || null,
          interests: interests,
        } as any)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("plan_members")
        .insert({ plan_id: (plan as any).id, user_id: currentUserId, role: "owner" } as any);

      if (!coverUrl) {
        supabase.functions.invoke("generate-cover-image", {
          body: { destination_name: destination.trim(), plan_id: (plan as any).id },
        }).catch(err => console.error("AI cover failed:", err));
      }

      toast.success("Plan created successfully! 🎉");
      onComplete();
    } catch (err: any) {
      console.error("Create plan error:", err);
      toast.error(err.message || "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderRestrictions = () => {
    const g = userGender?.toLowerCase();
    if (g === "male") return { canMale: true, canFemale: false };
    if (g === "female") return { canMale: false, canFemale: true };
    return { canMale: true, canFemale: true };
  };

  const { canMale, canFemale } = genderRestrictions();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold flex-1">Create Plan</h1>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Plan Name *</Label>
          <Input
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            placeholder="Give your adventure a catchy name"
            className="h-12"
            maxLength={100}
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Destination *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Search destination..."
              className="h-12 pl-10"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start h-12", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd") : "Pick"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={d => d < new Date()} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start h-12", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Group Size: <span className="text-primary">{maxMembers}</span></Label>
          <Slider value={[maxMembers]} onValueChange={v => setMaxMembers(v[0])} min={1} max={20} step={1} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1</span><span>20</span>
          </div>
        </div>

        {/* Group Type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Group Type *</Label>
          <div className="flex gap-2">
            {[
              { value: "everyone", label: "Everyone", icon: Users, enabled: true },
              { value: "males_only", label: "Males Only", icon: Shield, enabled: canMale },
              { value: "females_only", label: "Females Only", icon: Shield, enabled: canFemale },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => opt.enabled && setGroupType(opt.value)}
                disabled={!opt.enabled}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-center",
                  groupType === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                  !opt.enabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <opt.icon className={cn("w-4 h-4", groupType === opt.value ? "text-primary" : "text-muted-foreground")} />
                <span className="text-[10px] font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Visibility *</Label>
          <div className="flex gap-2">
            {[
              { value: "public", label: "Public", icon: Eye, desc: "Visible to everyone" },
              { value: "private", label: "Private", icon: EyeOff, desc: "Only companions" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setVisibility(opt.value)}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-center",
                  visibility === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                )}
              >
                <opt.icon className={cn("w-4 h-4", visibility === opt.value ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interests / Badges */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Interests * <span className="text-muted-foreground font-normal">(select 3–5)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(item => {
              const selected = interests.includes(item.label);
              return (
                <button
                  key={item.label}
                  onClick={() => toggleInterest(item.label)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all text-xs font-medium",
                    selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {interests.length > 0 && interests.length < 3 && (
            <p className="text-[10px] text-destructive">Select at least {3 - interests.length} more</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your itinerary, travel style, and expectations..."
            className="min-h-[100px]"
            maxLength={1000}
          />
          <p className="text-[10px] text-muted-foreground text-right">{description.length}/1000</p>
        </div>

        {/* Cover Photo */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Cover Photo <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
          {coverPreview ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <Button variant="secondary" size="sm" className="absolute bottom-2 right-2" onClick={() => { setCoverFile(null); setCoverPreview(null); }}>
                Remove
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/1] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-3 transition-colors bg-muted/30"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs font-medium">Tap to upload</p>
                <p className="text-[10px] text-muted-foreground">or skip for AI cover</p>
              </div>
            </button>
          )}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-[10px] text-muted-foreground">Skip to auto-generate a cover of {destination || "your destination"}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-border">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full h-14 text-lg rounded-2xl bg-gradient-primary"
        >
          {isSubmitting ? "Creating Plan..." : "Create Plan 🚀"}
        </Button>
      </div>
    </div>
  );
};

export default PlanBuilder;
