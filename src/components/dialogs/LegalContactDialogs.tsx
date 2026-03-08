import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, CheckCircle, Shield, FileText, Headphones, Mail, ChevronRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Section = "menu" | "support" | "contact" | "privacy" | "terms";

export const HelpLegalDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("menu");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleClose = (val: boolean) => {
    if (!val) {
      setSection("menu");
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    onOpenChange(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
  };

  const menuItems = [
    { key: "support" as Section, icon: Headphones, label: "Customer Support", desc: "Get help and FAQs" },
    { key: "contact" as Section, icon: Mail, label: "Contact Us", desc: "Send us a message" },
    { key: "privacy" as Section, icon: Shield, label: "Privacy Policy", desc: "How we handle your data" },
    { key: "terms" as Section, icon: FileText, label: "Terms of Service", desc: "Usage terms and conditions" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {section !== "menu" && (
              <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg -ml-1" onClick={() => { setSection("menu"); setSubmitted(false); }}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {section === "menu" && <><Headphones className="w-5 h-5 text-primary" /> Help & Support</>}
            {section === "support" && "Customer Support"}
            {section === "contact" && "Contact Us"}
            {section === "privacy" && "Privacy Policy"}
            {section === "terms" && "Terms of Service"}
          </DialogTitle>
        </DialogHeader>

        {/* Menu */}
        {section === "menu" && (
          <div className="space-y-2">
            {menuItems.map(({ key, icon: Icon, label, desc }) => (
              <Card
                key={key}
                className="p-3 rounded-2xl border-0 shadow-soft cursor-pointer hover:shadow-medium transition-all active:scale-[0.98]"
                onClick={() => setSection(key)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{label}</h4>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>
            ))}

            <div className="bg-muted rounded-xl p-3 mt-3 space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Email:</span> info.roamio@gmail.com</p>
              <p><span className="font-medium text-foreground">Phone:</span> +91 7781043277</p>
              <p><span className="font-medium text-foreground">Hours:</span> Mon–Fri: 2 PM – 8 PM | Sat–Sun: 8 AM – 8 PM</p>
            </div>
          </div>
        )}

        {/* Customer Support */}
        {section === "support" && (
          <div className="space-y-3">
            <Card className="p-3 rounded-2xl border-0 shadow-soft">
              <h4 className="font-semibold text-sm mb-2">Frequently Asked Questions</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                {[
                  { q: "How do I verify my profile?", a: "Go to Account → Verify Yourself and follow the selfie verification steps." },
                  { q: "How do I join a women-only trip?", a: "Browse trips on the Companion page and request to join. Gender verification may be required." },
                  { q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the login screen to receive a reset email." },
                  { q: "Can I delete my account?", a: "Contact us via the form below and we'll process your request within 48 hours." },
                ].map((faq, i) => (
                  <div key={i} className="p-2.5 bg-muted/50 rounded-xl">
                    <p className="font-medium text-foreground text-[11px]">{faq.q}</p>
                    <p className="mt-0.5 text-[10px]">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Button variant="outline" className="w-full rounded-xl text-xs h-9" onClick={() => setSection("contact")}>
              <Mail className="w-3.5 h-3.5 mr-1.5" /> Still need help? Contact us
            </Button>
          </div>
        )}

        {/* Contact Us */}
        {section === "contact" && (
          submitted ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle className="w-12 h-12 text-success" />
              <h3 className="font-semibold text-base">Thank you!</h3>
              <p className="text-sm text-muted-foreground text-center">We'll get back to you within 24-48 hours.</p>
              <Button onClick={() => handleClose(false)} className="mt-2 rounded-xl">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[10px]">Name *</Label>
                  <Input placeholder="Your name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="text-xs h-9 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Email *</Label>
                  <Input type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="text-xs h-9 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Subject</Label>
                <Input placeholder="What's this about?" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} className="text-xs h-9 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Message *</Label>
                <Textarea placeholder="Tell us how we can help..." value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={3} className="text-xs rounded-xl" />
              </div>
              <Button type="submit" className="w-full gap-2 rounded-xl h-9 text-xs">
                <Send className="w-3.5 h-3.5" /> Send Message
              </Button>
            </form>
          )
        )}

        {/* Privacy Policy */}
        {section === "privacy" && (
          <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground font-semibold text-xs">Last updated: March 4, 2026</p>
              {[
                { t: "1. Information We Collect", c: "We collect information you provide directly, including your name, email address, phone number, profile details, travel preferences, and location data when enabled. We also collect selfie images for gender verification in women-only groups, which are processed in real-time and not stored." },
                { t: "2. How We Use Your Information", c: "Your information is used to provide and improve our travel companion matching services, facilitate group trip coordination, personalize travel recommendations, ensure safety in gender-specific groups, and communicate important updates." },
                { t: "3. Location Data", c: "When you enable location services, we collect your approximate location to show nearby companions and relevant local recommendations. You can disable location sharing at any time through your account settings." },
                { t: "4. Data Sharing", c: "We do not sell your personal information. We may share limited profile information with other users for companion matching purposes. We use trusted third-party services for authentication, data storage, and AI-powered features." },
                { t: "5. Data Security", c: "We implement industry-standard security measures including encryption, secure authentication, and row-level security policies to protect your data." },
                { t: "6. Your Rights", c: "You have the right to access, update, or delete your personal information. You can manage your preferences through account settings or contact us directly for data-related requests." },
                { t: "7. Contact Us", c: "For privacy-related inquiries, please contact us at info.roamio@gmail.com." },
              ].map(({ t, c }) => (
                <section key={t}>
                  <h3 className="text-foreground font-semibold mb-1 text-xs">{t}</h3>
                  <p className="text-xs">{c}</p>
                </section>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Terms of Service */}
        {section === "terms" && (
          <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground font-semibold text-xs">Last updated: March 4, 2026</p>
              {[
                { t: "1. Acceptance of Terms", c: "By accessing or using Roamio, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services." },
                { t: "2. User Accounts", c: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration and keep your profile information up to date." },
                { t: "3. Acceptable Use", c: "You agree not to misuse the platform, harass other users, provide false information during verification, or use the service for any unlawful purpose." },
                { t: "4. Travel Companion Matching", c: "Roamio facilitates connections between travelers but does not guarantee compatibility or safety. Users are responsible for exercising due diligence when meeting companions." },
                { t: "5. Content & Communication", c: "You retain ownership of content you post but grant Roamio a license to display it within the platform. Abusive or inappropriate content will be removed." },
                { t: "6. Limitation of Liability", c: "Roamio is provided \"as is\" without warranties. We are not liable for any damages arising from your use of the service." },
                { t: "7. Termination", c: "We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time." },
                { t: "8. Changes to Terms", c: "We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms." },
              ].map(({ t, c }) => (
                <section key={t}>
                  <h3 className="text-foreground font-semibold mb-1 text-xs">{t}</h3>
                  <p className="text-xs">{c}</p>
                </section>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
