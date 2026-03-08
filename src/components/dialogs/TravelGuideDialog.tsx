import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Languages, 
  Search, 
  Mic, 
  MicOff, 
  Volume2, 
  BookOpen,
  MapPin,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TravelGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCity?: string | null;
}

interface Phrase {
  original: string;
  translated: string;
  pronunciation: string;
}

interface Lesson {
  title: string;
  phrases: Phrase[];
}

interface TravelTip {
  tip: string;
  category: "general" | "do" | "dont";
}

interface LanguageInfo {
  language: string;
  languageCode: string;
  script: string;
  greeting: string;
}

const TravelGuideDialog: React.FC<TravelGuideDialogProps> = ({ open, onOpenChange, currentCity }) => {
  const [translatorText, setTranslatorText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [activeSection, setActiveSection] = useState("translator");
  const [isListening, setIsListening] = useState(false);
  const [isTranslatorListening, setIsTranslatorListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Dynamic data
  const [languageInfo, setLanguageInfo] = useState<LanguageInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tips, setTips] = useState<TravelTip[]>([]);
  const [loadingLanguage, setLoadingLanguage] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  const city = currentCity || "Delhi";

  // Detect local language when city changes
  useEffect(() => {
    if (!open) return;
    
    const detectLanguage = async () => {
      setLoadingLanguage(true);
      try {
        const { data, error } = await supabase.functions.invoke("travel-guide", {
          body: { action: "detect_language", city },
        });
        if (error) throw error;
        if (data?.language) {
          setLanguageInfo(data);
        }
      } catch (err) {
        console.error("Language detection error:", err);
        setLanguageInfo({ language: "Hindi", languageCode: "hi", script: "Devanagari", greeting: "नमस्ते" });
      } finally {
        setLoadingLanguage(false);
      }
    };

    detectLanguage();
  }, [city, open]);

  // Load tips when dialog opens
  useEffect(() => {
    if (!open || tips.length > 0) return;
    
    const loadTips = async () => {
      setLoadingTips(true);
      try {
        const { data, error } = await supabase.functions.invoke("travel-guide", {
          body: { action: "tips", city },
        });
        if (error) throw error;
        if (Array.isArray(data)) {
          setTips(data);
        }
      } catch (err) {
        console.error("Tips loading error:", err);
      } finally {
        setLoadingTips(false);
      }
    };

    loadTips();
  }, [open, city]);

  // Load lessons when Learn tab is selected
  useEffect(() => {
    if (activeSection !== "learn" || lessons.length > 0 || !languageInfo) return;
    
    const loadLessons = async () => {
      setLoadingLessons(true);
      try {
        const { data, error } = await supabase.functions.invoke("travel-guide", {
          body: { action: "lessons", toLang: languageInfo.language, city },
        });
        if (error) throw error;
        if (Array.isArray(data)) {
          setLessons(data);
        }
      } catch (err) {
        console.error("Lessons loading error:", err);
      } finally {
        setLoadingLessons(false);
      }
    };

    loadLessons();
  }, [activeSection, languageInfo, city]);

  // Reset data when city changes
  useEffect(() => {
    setLessons([]);
    setTips([]);
    setTranslatedText("");
    setPronunciation("");
  }, [city]);

  const handleTranslate = useCallback(async () => {
    if (!translatorText.trim() || !languageInfo) return;
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("travel-guide", {
        body: {
          action: "translate",
          text: translatorText,
          fromLang: "English",
          toLang: languageInfo.language,
        },
      });
      if (error) throw error;
      setTranslatedText(data?.translated || "Translation unavailable");
      setPronunciation(data?.pronunciation || "");
    } catch (err) {
      console.error("Translation error:", err);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }, [translatorText, languageInfo]);

  const startListening = (type: "translator") => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      setIsTranslatorListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranslatorText(transcript);
      };

      recognition.onerror = () => setIsTranslatorListening(false);
      recognition.onend = () => setIsTranslatorListening(false);
      recognition.start();
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  };

  const speakText = (text: string, langCode: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  const tipIcon = (category: string) => {
    switch (category) {
      case "do": return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />;
      case "dont": return <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />;
      default: return <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
    }
  };

  const tipBadge = (category: string) => {
    switch (category) {
      case "do": return <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">DO</Badge>;
      case "dont": return <Badge variant="outline" className="text-[10px] border-destructive text-destructive">DON'T</Badge>;
      default: return <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">TIP</Badge>;
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {city}
            {loadingLanguage ? (
              <Loader2 className="w-3 h-3 animate-spin ml-1" />
            ) : languageInfo && (
              <span className="ml-1">• {languageInfo.language} ({languageInfo.script})</span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language greeting banner */}
          {languageInfo && !loadingLanguage && (
            <Card className="p-3 bg-primary/5 border-primary/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Local greeting</p>
                  <p className="text-lg font-semibold">{languageInfo.greeting}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakText(languageInfo.greeting, languageInfo.languageCode)}
                  className="h-8 w-8 p-0"
                >
                  <Volume2 className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </Card>
          )}

          {/* Section tabs */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={`p-3 cursor-pointer hover:shadow-soft transition-all rounded-xl ${activeSection === "translator" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveSection("translator")}
            >
              <div className="text-center">
                <Volume2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Translator</p>
                <p className="text-xs text-muted-foreground">Voice & text</p>
              </div>
            </Card>
            <Card 
              className={`p-3 cursor-pointer hover:shadow-soft transition-all rounded-xl ${activeSection === "learn" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveSection("learn")}
            >
              <div className="text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Learn</p>
                <p className="text-xs text-muted-foreground">{languageInfo?.language || "Local"} basics</p>
              </div>
            </Card>
          </div>

          {/* Translator Section */}
          {activeSection === "translator" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                English → {languageInfo?.language || "Local language"}
              </h4>
              <div className="relative">
                <Input 
                  placeholder={`Type to translate to ${languageInfo?.language || "local language"}...`}
                  value={translatorText}
                  onChange={(e) => setTranslatorText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTranslate()}
                  className="pr-12 rounded-xl"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startListening("translator")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                >
                  {isTranslatorListening ? (
                    <MicOff className="w-4 h-4 text-destructive" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !translatorText.trim()}
                className="w-full rounded-xl bg-gradient-primary text-white border-0"
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2" />
                )}
                Translate
              </Button>
              {translatedText && (
                <Card className="p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium">{translatedText}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => speakText(translatedText, languageInfo?.languageCode || "hi")}
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                  {pronunciation && (
                    <p className="text-xs text-muted-foreground italic">{pronunciation}</p>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Learn Section */}
          {activeSection === "learn" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {languageInfo?.language || "Local"} Lessons for {city}
              </h4>
              {loadingLessons ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : lessons.length > 0 ? (
                lessons.map((lesson, idx) => (
                  <Card 
                    key={idx} 
                    className="rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                  >
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{lesson.title}</h5>
                        <p className="text-xs text-muted-foreground">{lesson.phrases.length} phrases</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedLesson === idx ? "rotate-90" : ""}`} />
                    </div>
                    {expandedLesson === idx && (
                      <div className="border-t px-3 pb-3 space-y-2 pt-2">
                        {lesson.phrases.map((phrase, pIdx) => (
                          <div key={pIdx} className="flex items-start justify-between gap-2 py-1.5 border-b last:border-0 border-dashed">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">{phrase.original}</p>
                              <p className="text-sm font-medium">{phrase.translated}</p>
                              {phrase.pronunciation && (
                                <p className="text-xs text-muted-foreground italic">{phrase.pronunciation}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakText(phrase.translated, languageInfo?.languageCode || "hi");
                              }}
                              className="h-7 w-7 p-0 flex-shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No lessons available yet.</p>
              )}
            </div>
          )}

          {/* Solo Travel Tips */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Solo Travel Tips for {city}</h4>
            {loadingTips ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))}
              </div>
            ) : tips.length > 0 ? (
              <div className="space-y-2 text-sm">
                {tips.map((t, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    {tipIcon(t.category)}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {tipBadge(t.category)}
                      </div>
                      <p>{t.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Use local metro/transit for efficient and safe travel</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Uber/Ola are reliable ride options</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Emergency: Police - 100, Tourist Helpline - 1363</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelGuideDialog;
