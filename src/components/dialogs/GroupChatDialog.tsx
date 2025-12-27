import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users } from "lucide-react";
import { useGroupMessages } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface GroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string | null;
  groupName: string;
  currentUserId: string | null;
}

const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  open,
  onOpenChange,
  groupId,
  groupName,
  currentUserId
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useGroupMessages(groupId, currentUserId);

  // Scroll to bottom when messages change
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
          <DialogTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            {groupName}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">No messages yet</p>
              <p className="text-muted-foreground text-xs">Be the first to say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.user_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1]?.user_id !== msg.user_id;
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {showAvatar && !isOwn ? (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={msg.sender_avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {msg.sender_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ) : !isOwn ? (
                      <div className="w-8" />
                    ) : null}
                    
                    <div className={cn(
                      "max-w-[75%] flex flex-col",
                      isOwn ? "items-end" : "items-start"
                    )}>
                      {showAvatar && !isOwn && (
                        <span className="text-[10px] text-muted-foreground mb-1 px-1">
                          {msg.sender_name}
                        </span>
                      )}
                      <div className={cn(
                        "px-3 py-2 rounded-2xl text-sm",
                        isOwn 
                          ? "bg-gradient-primary text-white rounded-br-md" 
                          : "bg-muted rounded-bl-md"
                      )}>
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

        {/* Input Area */}
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

export default GroupChatDialog;
