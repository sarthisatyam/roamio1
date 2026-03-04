import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[85vh]">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Privacy Policy</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground font-semibold">Last updated: March 4, 2026</p>

          <section>
            <h3 className="text-foreground font-semibold mb-1">1. Information We Collect</h3>
            <p>We collect information you provide directly, including your name, email address, phone number, profile details, travel preferences, and location data when enabled. We also collect selfie images for gender verification in women-only groups, which are processed in real-time and not stored.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">2. How We Use Your Information</h3>
            <p>Your information is used to provide and improve our travel companion matching services, facilitate group trip coordination, personalize travel recommendations, ensure safety in gender-specific groups, and communicate important updates.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">3. Location Data</h3>
            <p>When you enable location services, we collect your approximate location to show nearby companions and relevant local recommendations. You can disable location sharing at any time through your account settings.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">4. Data Sharing</h3>
            <p>We do not sell your personal information. We may share limited profile information with other users for companion matching purposes. We use trusted third-party services for authentication, data storage, and AI-powered features.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">5. Data Security</h3>
            <p>We implement industry-standard security measures including encryption, secure authentication, and row-level security policies to protect your data.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">6. Your Rights</h3>
            <p>You have the right to access, update, or delete your personal information. You can manage your preferences through account settings or contact us directly for data-related requests.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">7. Contact Us</h3>
            <p>For privacy-related inquiries, please contact us at <span className="text-primary font-medium">privacy@roamio.app</span>.</p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export const TermsOfServiceDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[85vh]">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Terms of Service</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground font-semibold">Last updated: March 4, 2026</p>

          <section>
            <h3 className="text-foreground font-semibold mb-1">1. Acceptance of Terms</h3>
            <p>By accessing or using Roamio, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">2. User Accounts</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration and keep your profile information up to date.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">3. Acceptable Use</h3>
            <p>You agree not to misuse the platform, harass other users, provide false information during verification, or use the service for any unlawful purpose. Violating gender-specific group policies through deception will result in account suspension.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">4. Travel Companion Matching</h3>
            <p>Roamio facilitates connections between travelers but does not guarantee compatibility or safety. Users are responsible for exercising due diligence when meeting companions. We recommend meeting in public places and informing trusted contacts of your plans.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">5. Content & Communication</h3>
            <p>You retain ownership of content you post but grant Roamio a license to display it within the platform. Abusive, discriminatory, or inappropriate content will be removed and may result in account action.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">6. Limitation of Liability</h3>
            <p>Roamio is provided "as is" without warranties. We are not liable for any damages arising from your use of the service, interactions with other users, or travel-related incidents.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">7. Termination</h3>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your account settings.</p>
          </section>

          <section>
            <h3 className="text-foreground font-semibold mb-1">8. Changes to Terms</h3>
            <p>We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export const ContactDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Contact Us</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle className="w-12 h-12 text-success" />
            <h3 className="font-semibold text-base">Thank you!</h3>
            <p className="text-sm text-muted-foreground text-center">Your message has been received. We'll get back to you within 24-48 hours.</p>
            <Button onClick={() => handleClose(false)} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-xs">Name *</Label>
                <Input id="contact-name" placeholder="Your name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-xs">Email *</Label>
                <Input id="contact-email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-subject" className="text-xs">Subject</Label>
              <Input id="contact-subject" placeholder="What's this about?" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message" className="text-xs">Message *</Label>
              <Textarea id="contact-message" placeholder="Tell us how we can help..." value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} maxLength={1000} rows={4} />
            </div>

            <div className="bg-muted rounded-xl p-3 space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Email:</span> support@roamio.app</p>
              <p><span className="font-medium text-foreground">Phone:</span> +91 1800-ROAMIO (762646)</p>
              <p><span className="font-medium text-foreground">Hours:</span> Mon–Sat, 9 AM – 6 PM IST</p>
            </div>

            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" /> Send Message
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
