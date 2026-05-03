import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHostProfile } from "@/hooks/useHostProfile";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess?: () => void;
}

const BecomeHostDialog: React.FC<Props> = ({ open, onOpenChange, onSuccess }) => {
  const { apply } = useHostProfile();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    legal_name: "",
    business_name: "",
    gstin: "",
    city: "",
    bio: "",
    experience_years: 1,
    website: "",
    instagram: "",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.legal_name.trim() || !form.city.trim() || !form.bio.trim()) {
      toast.error("Please fill legal name, city, and a short bio");
      return;
    }
    setSubmitting(true);
    try {
      await apply(form);
      toast.success("You're now a verified host! Start publishing trips.");
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Become a Host
          </DialogTitle>
          <DialogDescription>
            Publish curated trips, collect bookings, and grow your travel business with Roamio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Legal name *</Label>
            <Input value={form.legal_name} onChange={(e) => update("legal_name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Business name</Label>
              <Input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} />
            </div>
            <div>
              <Label>GSTIN</Label>
              <Input value={form.gstin} onChange={(e) => update("gstin", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <Label>Years of experience</Label>
              <Input type="number" min={0} value={form.experience_years}
                onChange={(e) => update("experience_years", parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <Label>About you / your trips *</Label>
            <Textarea rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@handle" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeHostDialog;
