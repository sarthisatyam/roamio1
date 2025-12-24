import React, { useState } from "react";
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
  const [contacts, setContacts] = useState([
    { name: "Emergency Contact 1", phone: "+91 98765 43210", relation: "Parent" },
    { name: "Emergency Contact 2", phone: "+91 87654 32109", relation: "Sibling" }
  ]);

  const handleSOS = () => {
    toast.success("SOS alert sent to all emergency contacts!");
    // In real app, this would trigger actual SOS
  };

  return (
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
            className="w-full h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg font-bold rounded-xl"
          >
            <AlertTriangle className="w-6 h-6 mr-2" />
            SOS - Send Alert Now
          </Button>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Emergency Contacts</h4>
            {contacts.map((contact, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{contact.relation}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full rounded-xl">
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
  );
};

// Parental Control Dialog
interface ParentalControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ParentalControlDialog: React.FC<ParentalControlDialogProps> = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState({
    locationSharing: true,
    tripNotifications: true,
    sosAlerts: true,
    checkInReminders: false,
    nightModeRestrictions: false
  });

  const handleSave = () => {
    toast.success("Parental control settings saved!");
    onOpenChange(false);
  };

  return (
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
                onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
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
  id: number;
  name: string;
  profileImage: string;
  age: number;
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
                    <div className={`w-2 h-2 rounded-full ${companion.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
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

// My Interests Dialog
interface MyInterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interests?: string[];
  gender?: string;
  age?: number;
  about?: string;
}

export const MyInterestsDialog: React.FC<MyInterestsDialogProps> = ({ 
  open, 
  onOpenChange, 
  interests = [], 
  gender = "Not specified",
  age,
  about = "No description yet"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            My Interests
          </DialogTitle>
          <DialogDescription>Your travel preferences and profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-xl">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <p className="text-sm font-medium">{gender}</p>
            </div>
            {age && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Age</label>
                <p className="text-sm font-medium">{age} years</p>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Interests</label>
            {interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interests added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-sm py-1 px-3">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">About</label>
            <p className="text-sm p-3 bg-muted/30 rounded-xl">{about}</p>
          </div>
        </div>
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

interface TravelListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  places?: Place[];
}

export const TravelListDialog: React.FC<TravelListDialogProps> = ({ open, onOpenChange, places = [] }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-success" />
            Travel List
          </DialogTitle>
          <DialogDescription>Your saved destinations</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {places.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No destinations saved yet</p>
              <p className="text-xs text-muted-foreground mt-1">Bookmark places to add them here</p>
            </div>
          ) : (
            places.map((place) => (
              <Card key={place.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 text-2xl flex items-center justify-center bg-muted rounded-full">
                    {place.image}
                  </div>
                  <div>
                    <h4 className="font-semibold">{place.name}</h4>
                    <p className="text-sm text-muted-foreground">Saved destination</p>
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
