import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

interface CompanionData {
  id: number;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  profileImage: string;
  verified: boolean;
}

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companion: CompanionData | null;
  onConnect: (companionId: number, message: string) => void;
}

const ConnectDialog: React.FC<ConnectDialogProps> = ({
  open,
  onOpenChange,
  companion,
  onConnect
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleConnect = async () => {
    if (!companion) return;
    
    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onConnect(companion.id, message);
    toast.success(`Connection request sent to ${companion.name}!`);
    setMessage("");
    setIsSending(false);
    onOpenChange(false);
  };

  if (!companion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Connect with {companion.name}
          </DialogTitle>
          <DialogDescription>
            Send a personalized message to introduce yourself
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/50 rounded-xl mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl">
              {companion.profileImage}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{companion.name}, {companion.age}</h4>
                {companion.verified && (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{companion.location}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{companion.bio}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {companion.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your message (optional)</label>
          <Textarea
            placeholder={`Hi ${companion.name}! I saw we share similar interests...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none rounded-xl"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isSending}
            className="bg-gradient-primary text-white border-0 rounded-xl"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
