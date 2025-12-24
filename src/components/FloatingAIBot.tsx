import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingAIBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Roamio AI, your travel companion. How can I help you today?",
      isBot: true,
      time: "now"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const quickActions = [
    "Find safe hostels",
    "Emergency contacts",
    "Local customs",
    "Transportation tips"
  ];

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("hostel") || msg.includes("stay") || msg.includes("hotel")) {
      return "For safe hostels in Delhi, I recommend Hyderabad Backpackers Hub in Banjara Hills (₹800/night) or Gachibowli Tech Stays (₹1,200/night). Both have 24/7 security, verified reviews, and are solo-traveler friendly. Would you like me to show you booking options?";
    }
    if (msg.includes("emergency") || msg.includes("help") || msg.includes("sos")) {
      return "For emergencies in India:\n• Police: 100\n• Tourist Helpline: 1363\n• Women's Helpline: 181\n• Ambulance: 102\n\nYou can also set up SOS alerts in your Account → Emergency Details. Stay safe!";
    }
    if (msg.includes("transport") || msg.includes("cab") || msg.includes("metro") || msg.includes("travel")) {
      return "Delhi has excellent transport options:\n• Metro: Fastest & safest (₹20-60)\n• Uber/Ola: Reliable, share trip with contacts\n• Auto: Negotiate or use meter\n\nFor intercity travel, check the Bookings tab for flights, trains, and cabs!";
    }
    if (msg.includes("food") || msg.includes("eat") || msg.includes("restaurant")) {
      return "Must-try Delhi food spots:\n• Paranthe Wali Gali (Old Delhi) - Famous paranthas\n• Chandni Chowk - Street food heaven\n• Khan Market - Cafes & restaurants\n\nAlways check hygiene ratings and carry water. Want me to add a food tour to your journey?";
    }
    if (msg.includes("safe") || msg.includes("custom") || msg.includes("culture")) {
      return "Delhi travel tips:\n• Dress modestly at religious sites\n• Keep valuables secure\n• Use women-only metro coaches\n• Avoid isolated areas at night\n• Share live location with trusted contacts\n\nCheck the Travel Guide in your Account for more tips!";
    }
    
    return "I can help you with safe hostels, emergency contacts, transportation, food recommendations, and local customs. What would you like to know about?";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      time: "now"
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = inputMessage;
    setInputMessage("");

    // Generate contextual AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getAIResponse(userInput),
        isBot: true,
        time: "now"
      };
      setMessages(prev => [...prev, botResponse]);
    }, 800);
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="default"
          className={cn(
            "w-14 h-14 rounded-full bg-gradient-primary text-white shadow-strong",
            "hover:scale-110 transition-transform duration-300",
            isOpen && "hidden"
          )}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end justify-center p-4">
          <Card className="w-full max-w-md h-96 flex flex-col shadow-strong">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Roamio AI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <p className="text-xs text-white/80">Online</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm",
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-gradient-primary text-white"
                    )}
                  >
                    {message.isBot && (
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-medium">Roamio AI</span>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Badge
                    key={action}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 text-xs"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="bg-gradient-primary text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingAIBot;