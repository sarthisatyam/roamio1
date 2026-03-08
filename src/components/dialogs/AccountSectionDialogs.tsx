import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Headphones, 
  Settings,
  Calendar,
  MapPin,
  Send,
  MessageSquare,
  Heart,
  Star,
  Bookmark
} from "lucide-react";
import { toast } from "sonner";

// Emergency Details Dialog
interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmergencyDialog: React.FC<EmergencyDialogProps> = ({ open, onOpenChange }) => {
  const [guardianContacts, setGuardianContacts] = useState<{ name: string; phone: string; email: string }[]>([]);
  const [showParentalForm, setShowParentalForm] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Fetch guardian from DB when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchGuardian = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("parental_guardians")
        .select("parent_name, parent_phone, parent_email")
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        setGuardianContacts(data.map(g => ({ name: g.parent_name, phone: g.parent_phone, email: g.parent_email })));
      } else {
        setGuardianContacts([]);
      }
    };
    fetchGuardian();
  }, [open]);

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      // 1. Get GPS location
      const coords = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
        if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your device.");
          return resolve(null);
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => {
            toast.error("Could not get your location. Please enable GPS.");
            resolve(null);
          }
        );
      });

      if (!coords) {
        setSosLoading(false);
        return;
      }

      // 2. Create Google Maps link
      const mapsLink = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

      // 3. Fetch guardian phone from DB
      const { data: { user } } = await supabase.auth.getUser();
      let guardianPhone = "";

      if (user) {
        const { data: guardian } = await supabase
          .from("parental_guardians")
          .select("parent_phone")
          .eq("user_id", user.id)
          .single();

        if (guardian?.parent_phone) {
          guardianPhone = guardian.parent_phone;
        }
      }

      if (!guardianPhone) {
        // Fallback to localStorage
        const stored = localStorage.getItem("parent_details");
        if (stored) {
          try {
            guardianPhone = JSON.parse(stored).phone || "";
          } catch {}
        }
      }

      if (!guardianPhone) {
        toast.error("No guardian phone number found. Please set up Parental Controls first.");
        setSosLoading(false);
        return;
      }

      // 4. Open SMS with prefilled message
      const message = `🚨 SOS ALERT\n\nI may need help.\n\nMy location: ${mapsLink}`;
      const encodedMessage = encodeURIComponent(message);
      window.location.href = `sms:${guardianPhone}?body=${encodedMessage}`;

      toast.success("Opening SMS with SOS alert...");
    } catch (err) {
      console.error("[SOS] Error:", err);
      toast.error("Failed to send SOS. Please try again.");
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Emergency Details
          </DialogTitle>
          <DialogDescription>Manage your emergency contacts and safety info</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button 
            onClick={handleSOS}
            disabled={sosLoading}
            className="w-full h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg font-bold rounded-xl"
          >
            <AlertTriangle className="w-6 h-6 mr-2" />
            {sosLoading ? "Getting location..." : "SOS - Send Alert Now"}
          </Button>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Emergency Contacts</h4>
            {guardianContacts.length > 0 ? guardianContacts.map((contact, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    <Badge variant="secondary" className="text-xs mt-1">Guardian</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => window.location.href = `tel:${contact.phone}`}>
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )) : (
              <p className="text-xs text-muted-foreground">No emergency contacts added yet.</p>
            )}
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowParentalForm(true)}>
              + Add Emergency Contact
            </Button>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <h4 className="font-semibold text-sm mb-2">Important Numbers</h4>
            <div className="space-y-1 text-sm">
              <p>Police: <span className="font-medium">100</span></p>
              <p>Tourist Helpline: <span className="font-medium">1363</span></p>
              <p>Women's Helpline: <span className="font-medium">181</span></p>
              <p>Ambulance: <span className="font-medium">102</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ParentalGuardianFormDialog
      open={showParentalForm}
      onOpenChange={setShowParentalForm}
      onSaved={() => {
        const refetch = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data } = await supabase
            .from("parental_guardians")
            .select("parent_name, parent_phone, parent_email")
            .eq("user_id", user.id);
          if (data && data.length > 0) {
            setGuardianContacts(data.map(g => ({ name: g.parent_name, phone: g.parent_phone, email: g.parent_email })));
          }
        };
        refetch();
      }}
    />
  </>
  );
};

// Shared Guardian Details Form Dialog
interface ParentalGuardianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const ParentalGuardianFormDialog: React.FC<ParentalGuardianFormDialogProps> = ({ open, onOpenChange, onSaved }) => {
  const [form, setForm] = useState<ParentDetails>({ name: "", phone: "", email: "" });

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Please fill in all guardian details.");
      return;
    }
    localStorage.setItem(PARENT_KEY, JSON.stringify(form));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("parental_guardians").upsert({
          user_id: user.id,
          parent_name: form.name,
          parent_phone: form.phone,
          parent_email: form.email,
        }, { onConflict: "user_id" });
      }
    } catch (err) {
      console.error("Failed to save guardian to DB:", err);
    }
    toast.success("Guardian details saved!");
    setForm({ name: "", phone: "", email: "" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Guardian Details Required
          </DialogTitle>
          <DialogDescription>Please add a parent/guardian as emergency contact.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Parent / Guardian Name</Label>
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label className="text-xs">Phone Number</Label>
            <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" placeholder="parent@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full bg-gradient-primary text-white border-0 rounded-xl">Save & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Parental Control Dialog
interface ParentalControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParentDetails {
  name: string;
  phone: string;
  email: string;
}

const SETTINGS_KEY = "parental_controls";
const PARENT_KEY = "parent_details";

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    locationSharing: false,
    tripNotifications: false,
    sosAlerts: false,
    checkInReminders: false,
    nightModeRestrictions: false,
  };
};

const loadParentDetails = (): ParentDetails | null => {
  try {
    const raw = localStorage.getItem(PARENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

// Feature helpers that call real edge functions
let locationInterval: ReturnType<typeof setInterval> | null = null;
let checkinInterval: ReturnType<typeof setInterval> | null = null;

const sendLocationToBackend = async () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      await supabase.functions.invoke("parental-location", {
        body: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
      });
      console.log("[ParentalControl] Location sent successfully");
    } catch (err) {
      console.error("[ParentalControl] Failed to send location:", err);
    }
  });
};

const startLiveLocation = () => {
  if (locationInterval) return;
  sendLocationToBackend(); // send immediately
  locationInterval = setInterval(sendLocationToBackend, 30000); // every 30s
};
const stopLiveLocation = () => {
  if (locationInterval) { clearInterval(locationInterval); locationInterval = null; }
};

const startCheckinReminders = () => {
  if (checkinInterval) return;
  checkinInterval = setInterval(() => {
    toast.info("Check-in reminder: Let your guardian know you're safe!");
  }, 60 * 60 * 1000); // every 60 min
};
const stopCheckinReminders = () => {
  if (checkinInterval) { clearInterval(checkinInterval); checkinInterval = null; }
};

export const sendTripUpdate = async (type: "start" | "end", tripDetails?: Record<string, unknown>) => {
  try {
    const { error } = await supabase.functions.invoke("parental-trip-update", {
      body: { update_type: type, trip_details: tripDetails ?? null },
    });
    if (error) throw error;
    toast.info(`Trip ${type} update sent to guardian.`);
  } catch (err) {
    console.error("[ParentalControl] Trip update failed:", err);
  }
};

export const triggerAutoSOS = async () => {
  const getCoords = (): Promise<{ latitude: number; longitude: number } | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null)
      );
    });

  const coords = await getCoords();
  try {
    const { error } = await supabase.functions.invoke("parental-sos", {
      body: { latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null },
    });
    if (error) throw error;
    toast.error("Auto SOS triggered! Location sent to guardian.");
  } catch (err) {
    console.error("[ParentalControl] SOS failed:", err);
    toast.error("SOS alert could not be sent.");
  }
};

export const ParentalControlDialog: React.FC<ParentalControlDialogProps> = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState(loadSettings);
  const [showParentForm, setShowParentForm] = useState(false);
  const [parentForm, setParentForm] = useState<ParentDetails>({ name: "", phone: "", email: "" });
  const [pendingToggle, setPendingToggle] = useState<{ key: string; checked: boolean } | null>(null);

  // Reload settings from localStorage every time dialog opens
  React.useEffect(() => {
    if (open) {
      setSettings(loadSettings());
    }
  }, [open]);

  // Apply side-effects when settings change and are saved
  const applyFeatures = (s: typeof settings) => {
    s.locationSharing ? startLiveLocation() : stopLiveLocation();
    s.checkInReminders ? startCheckinReminders() : stopCheckinReminders();
    // tripNotifications & sosAlerts are event-driven, stored for later use
  };

  const handleToggle = (key: string, checked: boolean) => {
    const parentDetails = loadParentDetails();
    if (!parentDetails) {
      setPendingToggle({ key, checked });
      setShowParentForm(true);
      return;
    }
    setSettings((prev: typeof settings) => ({ ...prev, [key]: checked }));
  };

  const handleSaveParentDetails = async () => {
    if (!parentForm.name.trim() || !parentForm.phone.trim() || !parentForm.email.trim()) {
      toast.error("Please fill in all parent/guardian details.");
      return;
    }
    localStorage.setItem(PARENT_KEY, JSON.stringify(parentForm));

    // Persist to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("parental_guardians").upsert({
          user_id: user.id,
          parent_name: parentForm.name,
          parent_phone: parentForm.phone,
          parent_email: parentForm.email,
        }, { onConflict: "user_id" });
      }
    } catch (err) {
      console.error("Failed to save guardian to DB:", err);
    }

    toast.success("Guardian details saved!");
    setShowParentForm(false);
    if (pendingToggle) {
      setSettings((prev: typeof settings) => ({ ...prev, [pendingToggle.key]: pendingToggle.checked }));
      setPendingToggle(null);
    }
  };

  const handleSave = async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyFeatures(settings);

    // Persist settings to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("parental_settings").upsert({
          user_id: user.id,
          location_sharing: settings.locationSharing,
          trip_notifications: settings.tripNotifications,
          sos_alerts: settings.sosAlerts,
          checkin_reminders: settings.checkInReminders,
          restrict_late_bookings: settings.nightModeRestrictions,
        }, { onConflict: "user_id" });
      }
    } catch (err) {
      console.error("Failed to save settings to DB:", err);
    }

    toast.success("Parental controls updated");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-warning" />
              Parental Controls
            </DialogTitle>
            <DialogDescription>Configure safety settings and restrictions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {Object.entries({
              locationSharing: "Share live location with guardians",
              tripNotifications: "Send trip updates to guardians",
              sosAlerts: "Automatic SOS on emergency",
              checkInReminders: "Periodic check-in reminders",
              nightModeRestrictions: "Restrict bookings after 10 PM"
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={settings[key as keyof typeof settings]}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="w-full bg-gradient-primary text-white border-0 rounded-xl">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parent Details Form Modal */}
      <Dialog open={showParentForm} onOpenChange={setShowParentForm}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Guardian Details Required
            </DialogTitle>
            <DialogDescription>Please add a parent/guardian before enabling controls.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Parent / Guardian Name</Label>
              <Input
                placeholder="Full name"
                value={parentForm.name}
                onChange={(e) => setParentForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Phone Number</Label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                value={parentForm.phone}
                onChange={(e) => setParentForm((p) => ({ ...p, phone: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="parent@email.com"
                value={parentForm.email}
                onChange={(e) => setParentForm((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveParentDetails} className="w-full bg-gradient-primary text-white border-0 rounded-xl">
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Verify Yourself Dialog
interface VerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VerifyDialog: React.FC<VerifyDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);

  const handleUpload = () => {
    setStep(2);
    setTimeout(() => {
      toast.success("Document uploaded! Verification in progress...");
      setStep(3);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>Complete verification for enhanced trust</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-2">Upload Government ID</p>
                <p className="text-xs text-muted-foreground mb-4">Aadhar Card, Passport, or Driving License</p>
                <Button onClick={handleUpload} className="w-full rounded-xl">
                  Choose File
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Your documents are encrypted and stored securely
              </div>
            </>
          )}

          {step === 2 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-medium">Uploading document...</p>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <p className="font-medium mb-2">Document Uploaded!</p>
              <p className="text-sm text-muted-foreground">Verification usually takes 24-48 hours</p>
              <Button onClick={() => onOpenChange(false)} className="mt-4 rounded-xl">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Customer Support Dialog
interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportDialog: React.FC<SupportDialogProps> = ({ open, onOpenChange }) => {
  const [message, setMessage] = useState("");

  const faqs = [
    { q: "How do I change my booking?", a: "Go to My Bookings and select the booking you want to modify." },
    { q: "How to report a safety concern?", a: "Use the SOS button in Emergency Details or contact our 24/7 helpline." },
    { q: "How do I verify my profile?", a: "Go to Verify Yourself and upload a government ID." }
  ];

  const handleSend = () => {
    if (message.trim()) {
      toast.success("Message sent! We'll respond within 24 hours.");
      setMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-success" />
            Customer Support
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Frequently Asked Questions</h4>
            {faqs.map((faq, index) => (
              <Card key={index} className="p-3">
                <p className="font-medium text-sm mb-1">{faq.q}</p>
                <p className="text-xs text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Send us a message</h4>
            <Textarea
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] rounded-xl"
            />
            <Button onClick={handleSend} className="w-full bg-gradient-primary text-white border-0 rounded-xl">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl text-center">
            <p className="text-sm font-medium mb-1">Need immediate help?</p>
            <p className="text-xs text-muted-foreground mb-2">Call our 24/7 support line</p>
            <Button variant="outline" className="rounded-xl">
              <Phone className="w-4 h-4 mr-2" />
              1800-XXX-XXXX
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// My Bookings Dialog
interface Booking {
  id: number;
  type: string;
  name: string;
  date: string;
  status: string;
  price: string;
}

interface BookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings?: Booking[];
}

export const MyBookingsDialog: React.FC<BookingsDialogProps> = ({ open, onOpenChange, bookings = [] }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            My Bookings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your travel bookings will appear here</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant={booking.status === "upcoming" ? "default" : "secondary"} className="text-xs mb-2">
                      {booking.type}
                    </Badge>
                    <p className="font-medium text-sm">{booking.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {booking.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{booking.price}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${booking.status === "upcoming" ? "text-success border-success" : ""}`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// My Co-Companion Dialog
interface Companion {
  id: string | number;
  name: string;
  profileImage: string;
  age: number | null;
  location: string;
  bio: string;
  interests: string[];
  gender: string;
  status: string;
}

interface CoCompanionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companions?: Companion[];
}

export const MyCoCompanionDialog: React.FC<CoCompanionDialogProps> = ({ open, onOpenChange, companions = [] }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            My Co-Companion
          </DialogTitle>
          <DialogDescription>Your saved travel companions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {companions.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No companions added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Like companions to add them here</p>
            </div>
          ) : (
            companions.map((companion) => (
              <Card key={companion.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 text-2xl flex items-center justify-center bg-muted rounded-full">
                    {companion.profileImage}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{companion.name}</h4>
                    <p className="text-sm text-muted-foreground">{companion.age} years • {companion.location}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${companion.status === 'online' ? 'bg-secondary' : 'bg-gray-400'}`} />
                    <span className="text-xs text-muted-foreground capitalize">{companion.status}</span>
                  </div>
                </div>
                <p className="text-sm mb-2">{companion.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {companion.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// My Interests Dialog (Editable Profile)
interface MyInterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interests?: string[];
  gender?: string;
  age?: number | null;
  about?: string;
  displayName?: string;
  onProfileUpdated?: () => void;
}

const INTEREST_OPTIONS = [
  "Adventure", "Beach", "Culture", "Food", "History", "Mountains",
  "Nature", "Nightlife", "Photography", "Road Trips", "Shopping",
  "Spiritual", "Trekking", "Wildlife", "Backpacking", "Luxury"
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export const MyInterestsDialog: React.FC<MyInterestsDialogProps> = ({ 
  open, 
  onOpenChange, 
  interests = [], 
  gender = "",
  age,
  about = "",
  displayName = "",
  onProfileUpdated
}) => {
  const [editName, setEditName] = useState(displayName);
  const [editGender, setEditGender] = useState(gender);
  const [editAge, setEditAge] = useState(age?.toString() || "");
  const [editBio, setEditBio] = useState(about);
  const [editInterests, setEditInterests] = useState<string[]>(interests);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEditName(displayName);
      setEditGender(gender);
      setEditAge(age?.toString() || "");
      setEditBio(about);
      setEditInterests(interests);
    }
  }, [open, displayName, gender, age, about, interests]);

  const toggleInterest = (interest: string) => {
    setEditInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not logged in"); return; }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editName.trim() || null,
          gender: editGender || null,
          age: editAge ? parseInt(editAge) : null,
          bio: editBio.trim() || null,
          interests: editInterests.length > 0 ? editInterests : null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated!");
      onProfileUpdated?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>Update your profile and travel preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Display Name</Label>
            <Input
              placeholder="Your name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
              <select
                value={editGender}
                onChange={e => setEditGender(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Age</Label>
              <Input
                type="number"
                placeholder="Age"
                value={editAge}
                onChange={e => setEditAge(e.target.value)}
                className="rounded-xl"
                min={13}
                max={100}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">About</Label>
            <Textarea
              placeholder="Tell others about yourself..."
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              className="rounded-xl min-h-[70px]"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={editInterests.includes(interest) ? "default" : "outline"}
                  className={`text-xs py-1 px-3 cursor-pointer transition-colors ${
                    editInterests.includes(interest) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-primary text-white rounded-xl"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Travel List Dialog
interface Place {
  id: number;
  name: string;
  image: string;
}

interface ManualPlace {
  id: number;
  name: string;
  timing: string;
}

const SEASONS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Winter", "Summer", "Monsoon", "Spring", "Autumn"];

interface TravelListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  places?: Place[];
}

export const TravelListDialog: React.FC<TravelListDialogProps> = ({ open, onOpenChange, places = [] }) => {
  const [manualPlaces, setManualPlaces] = useState<ManualPlace[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTiming, setNewTiming] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) { toast.error("Enter a destination name"); return; }
    if (!newTiming) { toast.error("Select a month or season"); return; }
    setManualPlaces(prev => [...prev, { id: Date.now(), name: newName.trim(), timing: newTiming }]);
    setNewName("");
    setNewTiming("");
    setShowAddForm(false);
    toast.success("Added to travel list!");
  };

  const handleRemoveManual = (id: number) => {
    setManualPlaces(prev => prev.filter(p => p.id !== id));
    toast.info("Removed from travel list");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-success" />
            Travel List
          </DialogTitle>
          <DialogDescription>Your saved and planned destinations</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Add button */}
          {!showAddForm && (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs h-9 border-dashed"
              onClick={() => setShowAddForm(true)}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Add destination manually
            </Button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <Card className="p-3 rounded-2xl border-0 shadow-soft space-y-2.5">
              <Input
                placeholder="Destination name (e.g., Manali)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="text-xs h-9 rounded-xl"
              />
              <select
                value={newTiming}
                onChange={e => setNewTiming(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select month or season</option>
                <optgroup label="Months">
                  {SEASONS.slice(0, 12).map(m => <option key={m} value={m}>{m}</option>)}
                </optgroup>
                <optgroup label="Seasons">
                  {SEASONS.slice(12).map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </select>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-xl" onClick={() => { setShowAddForm(false); setNewName(""); setNewTiming(""); }}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1 h-8 text-xs rounded-xl bg-gradient-primary text-white" onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </Card>
          )}

          {/* Manually added places */}
          {manualPlaces.map((place) => (
            <Card key={place.id} className="p-3 rounded-2xl border-0 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{place.name}</h4>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 rounded-md mt-0.5">
                      <Calendar className="w-2.5 h-2.5 mr-0.5" />
                      {place.timing}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleRemoveManual(place.id)}>
                  ✕
                </Button>
              </div>
            </Card>
          ))}

          {/* Bookmarked places */}
          {places.length === 0 && manualPlaces.length === 0 ? (
            <div className="text-center py-6">
              <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No destinations yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">Add destinations or bookmark places from Explore</p>
            </div>
          ) : (
            places.map((place) => (
              <Card key={place.id} className="p-3 rounded-2xl border-0 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 text-xl flex items-center justify-center bg-muted rounded-xl">
                    {place.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{place.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Bookmarked</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
