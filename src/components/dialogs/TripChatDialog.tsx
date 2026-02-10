import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Shield } from "lucide-react";
import { useTripMessages } from "@/hooks/useTrips";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TripChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string | null;
  tripName: string;
  currentUserId: string | null;
}

const TripChatDialog: React.FC<TripChatDialogProps> = ({
  open,
  onOpenChange,
  tripId,
  tripName,
  currentUserId,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useTripMessages(tripId, currentUserId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    try {
      setIsSending(true);
      await sendMessage(message.trim());
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[70vh] flex flex-col p-0 rounded-2xl">
        <DialogHeader className="p-4 border-b bg-gradient-hero rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-white text-sm">
            <Shield className="w-4 h-4" />
            {tripName} — Group Chat
          </DialogTitle>
          <p className="text-white/70 text-[10px]">Trip-scoped • No phone numbers • Auto-expires after trip</p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Shield className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">No messages yet</p>
              <p className="text-muted-foreground text-xs">Coordinate your trip safely!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isOwn = msg.user_id === currentUserId;
                const showName = index === 0 || messages[index - 1]?.user_id !== msg.user_id;

                return (
                  <div
                    key={msg.id}
                    className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
                  >
                    <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                      {showName && !isOwn && (
                        <span className="text-[10px] text-muted-foreground mb-1 px-1">
                          {msg.sender_name}
                        </span>
                      )}
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm",
                          isOwn
                            ? "bg-gradient-primary text-white rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {format(new Date(msg.created_at), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-xl"
              disabled={isSending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="rounded-xl bg-gradient-primary text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripChatDialog;
