import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Languages, 
  Search, 
  Mic, 
  MicOff, 
  Volume2, 
  BookOpen 
} from "lucide-react";

interface TravelGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TravelGuideDialog: React.FC<TravelGuideDialogProps> = ({ open, onOpenChange }) => {
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [translatorText, setTranslatorText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [activeLanguageSection, setActiveLanguageSection] = useState("translator");
  const [isListening, setIsListening] = useState(false);
  const [isTranslatorListening, setIsTranslatorListening] = useState(false);

  const handleTranslate = () => {
    if (translatorText.trim()) {
      setTranslatedText(`${translatorText} → हिंदी में अनुवाद`);
    }
  };

  const startListening = (type: 'search' | 'translator') => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (type === 'search') {
        setIsListening(true);
      } else {
        setIsTranslatorListening(true);
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (type === 'search') {
          setLanguageSearchTerm(transcript);
        } else {
          setTranslatorText(transcript);
        }
      };

      recognition.onerror = () => {
        if (type === 'search') {
          setIsListening(false);
        } else {
          setIsTranslatorListening(false);
        }
      };

      recognition.onend = () => {
        if (type === 'search') {
          setIsListening(false);
        } else {
          setIsTranslatorListening(false);
        }
      };

      recognition.start();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Travel Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Hindi phrases..."
              value={languageSearchTerm}
              onChange={(e) => setLanguageSearchTerm(e.target.value)}
              className="pl-10 pr-12 rounded-xl"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startListening('search')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-destructive" />
              ) : (
                <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
              )}
            </Button>
          </div>

          {/* Language subsections */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={`p-3 cursor-pointer hover:shadow-soft transition-all rounded-xl ${activeLanguageSection === "translator" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveLanguageSection("translator")}
            >
              <div className="text-center">
                <Volume2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Translator</p>
                <p className="text-xs text-muted-foreground">Voice & text</p>
              </div>
            </Card>
            <Card 
              className={`p-3 cursor-pointer hover:shadow-soft transition-all rounded-xl ${activeLanguageSection === "learn" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveLanguageSection("learn")}
            >
              <div className="text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Learn</p>
                <p className="text-xs text-muted-foreground">Basic lessons</p>
              </div>
            </Card>
          </div>

          {/* Translator Section */}
          {activeLanguageSection === "translator" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Text Translator</h4>
              <div className="relative">
                <Input 
                  placeholder="Enter text to translate to Hindi..."
                  value={translatorText}
                  onChange={(e) => setTranslatorText(e.target.value)}
                  className="pr-12 rounded-xl"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startListening('translator')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                >
                  {isTranslatorListening ? (
                    <MicOff className="w-4 h-4 text-destructive" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </Button>
              </div>
              <Button onClick={handleTranslate} className="w-full rounded-xl bg-gradient-primary text-white border-0">
                <Volume2 className="w-4 h-4 mr-2" />
                Translate
              </Button>
              {translatedText && (
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm">{translatedText}</p>
                </div>
              )}
            </div>
          )}

          {/* Learn Section */}
          {activeLanguageSection === "learn" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Hindi Lessons</h4>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 rounded-xl">
                <h5 className="font-medium text-sm mb-1">Basic Greetings</h5>
                <p className="text-xs text-muted-foreground">Learn common Hindi greetings</p>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 rounded-xl">
                <h5 className="font-medium text-sm mb-1">Numbers 1-10</h5>
                <p className="text-xs text-muted-foreground">Essential counting in Hindi</p>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-muted/50 rounded-xl">
                <h5 className="font-medium text-sm mb-1">Travel Phrases</h5>
                <p className="text-xs text-muted-foreground">Useful phrases for getting around</p>
              </Card>
            </div>
          )}

          {/* Solo Travel Tips */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Solo Travel Tips for Delhi</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Use Delhi Metro for efficient and safe travel</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Uber/Ola are reliable ride options</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Try street food at Chandni Chowk</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Emergency: Police - 100, Tourist Helpline - 1363</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelGuideDialog;