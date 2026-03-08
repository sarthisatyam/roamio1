import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft, ArrowRight, CalendarIcon, MapPin, Users, Shield, Upload,
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

const TOTAL_STEPS = 9;

const PlanBuilder: React.FC<PlanBuilderProps> = ({ currentUserId, userGender, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
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

  const progress = (step / TOTAL_STEPS) * 100;

  const canProceed = () => {
    switch (step) {
      case 1: return planName.trim().length > 0;
      case 2: return destination.trim().length > 0;
      case 3: return startDate && endDate && endDate >= startDate;
      case 4: return maxMembers >= 1;
      case 5: return !!groupType;
      case 6: return true; // description optional
      case 7: return true; // photo optional
      case 8: return !!visibility;
      case 9: return true;
      default: return false;
    }
  };

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
      if (prev.length >= 2) { toast.error("Max 2 interests"); return prev; }
      return [...prev, label];
    });
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    setIsSubmitting(true);
    try {
      let coverUrl: string | undefined;

      // Upload cover if provided
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

      // Add creator as owner
      await supabase
        .from("plan_members")
        .insert({ plan_id: (plan as any).id, user_id: currentUserId, role: "owner" } as any);

      // Generate AI cover if no upload
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
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={step > 1 ? () => setStep(s => s - 1) : onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm text-muted-foreground font-medium">Step {step} of {TOTAL_STEPS}</span>
          <div className="w-10" />
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Name your plan</h2>
              <p className="text-muted-foreground mt-1">Give your adventure a catchy name</p>
            </div>
            <Input
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="Enter a name for your plan"
              className="text-lg h-14"
              maxLength={100}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Where's your next adventure?</h2>
              <p className="text-muted-foreground mt-1">Search for your destination</p>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Search destination..."
                className="text-lg h-14 pl-11"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Travel dates</h2>
              <p className="text-muted-foreground mt-1">When are you heading out?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start h-12", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={d => d < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start h-12", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={d => d < (startDate || new Date())}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Group size</h2>
              <p className="text-muted-foreground mt-1">How many people can join?</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-6">{maxMembers}</div>
              <p className="text-muted-foreground mb-4">People</p>
              <Slider
                value={[maxMembers]}
                onValueChange={v => setMaxMembers(v[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Group type</h2>
              <p className="text-muted-foreground mt-1">Who can join this plan?</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "everyone", label: "Everyone", icon: Users, desc: "Open to all genders", enabled: true },
                { value: "males_only", label: "Males Only", icon: Shield, desc: "Only male travelers", enabled: canMale },
                { value: "females_only", label: "Females Only", icon: Shield, desc: "Only female travelers", enabled: canFemale },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => opt.enabled && setGroupType(opt.value)}
                  disabled={!opt.enabled}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                    groupType === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                    !opt.enabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", groupType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </div>
                  {groupType === opt.value && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Describe your plan</h2>
              <p className="text-muted-foreground mt-1">Share your itinerary and expectations</p>
            </div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your itinerary, travel style, and expectations..."
              className="min-h-[160px] text-base"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Cover photo</h2>
              <p className="text-muted-foreground mt-1">Upload an image or we'll generate one with AI ✨</p>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            {coverPreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3"
                  onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 transition-colors bg-muted/30"
              >
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Tap to upload</p>
                  <p className="text-sm text-muted-foreground">or skip for AI-generated cover</p>
                </div>
              </button>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">If you skip, we'll generate a beautiful cover image of {destination || "your destination"} using AI</p>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Plan visibility</h2>
              <p className="text-muted-foreground mt-1">Who can see and join your plan?</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "public", label: "Public Plan", icon: Eye, desc: "Visible to everyone in Explore. Anyone can request to join." },
                { value: "private", label: "Private Plan", icon: EyeOff, desc: "Only visible to your travel companions. Only they can request to join." },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                    visibility === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", visibility === opt.value ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </div>
                  {visibility === opt.value && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Select interests</h2>
              <p className="text-muted-foreground mt-1">Choose up to 2 that best describe your plan</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {INTERESTS.map(item => {
                const selected = interests.includes(item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => toggleInterest(item.label)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/30",
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", selected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-xs font-medium text-center", selected ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-3 border-t border-border">
        {step < TOTAL_STEPS ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="w-full h-14 text-lg rounded-2xl bg-gradient-primary"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 text-lg rounded-2xl bg-gradient-primary"
          >
            {isSubmitting ? "Creating Plan..." : "Create Plan 🚀"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanBuilder;
