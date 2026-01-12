import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { 
  MapPin, 
  Shield, 
  Users, 
  ArrowRight,
  Mail,
  Phone,
  CheckCircle2,
  Compass,
  DollarSign,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  onComplete: (data: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean }) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    otp: "",
    preferences: [] as string[],
    language: "en",
    locationEnabled: false
  });

  const preferences = [
    { 
      id: "safety", 
      label: "Safety", 
      icon: Shield, 
      description: "Priority safety features",
      colorScheme: {
        selected: "border-red-400 bg-red-50 dark:bg-red-950/30",
        iconBg: "bg-red-500 text-white",
        hover: "hover:border-red-300"
      }
    },
    { 
      id: "community", 
      label: "Community", 
      icon: Users, 
      description: "Connect with travelers",
      colorScheme: {
        selected: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
        iconBg: "bg-blue-500 text-white",
        hover: "hover:border-blue-300"
      }
    },
    { 
      id: "budget", 
      label: "Budget", 
      icon: DollarSign, 
      description: "Cost-effective options",
      colorScheme: {
        selected: "border-secondary bg-accent dark:bg-secondary/20",
        iconBg: "bg-secondary text-white",
        hover: "hover:border-secondary/60"
      }
    },
    { 
      id: "flexibility", 
      label: "Flexibility", 
      icon: Compass, 
      description: "Adaptable plans",
      colorScheme: {
        selected: "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
        iconBg: "bg-purple-500 text-white",
        hover: "hover:border-purple-300"
      }
    }
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Quick Setup
        return formData.name.trim() !== "" && formData.emailOrPhone.trim() !== "";
      case 2: // OTP Verification
        return formData.otp.length === 4 && formData.otp === "1234";
      case 3: // Preferences
        return formData.preferences.length > 0;
      default:
        return true;
    }
  };

  const togglePreference = (prefId: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(p => p !== prefId)
        : [...prev.preferences, prefId]
    }));
  };

  const StepIndicator = () => (
    <div className="flex justify-center space-x-2 mb-8">
      {[0, 1, 2, 3].map((step) => (
        <div
          key={step}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            currentStep === step
              ? "bg-primary-foreground w-8"
              : currentStep > step
              ? "bg-primary-foreground/80"
              : "bg-primary-foreground/30"
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Step 1: Welcome Screen */}
      {currentStep === 0 && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
          <div className="max-w-sm mx-auto space-y-8">
            <div className="space-y-6">
              <img 
                src="/og-image.jpg" 
                alt="Roamio Logo" 
                className="w-48 h-48 mx-auto object-cover rounded-3xl shadow-strong border-4 border-white/20"
              />
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
                  Travel Solo,<br />Not Alone
                </h1>
                <p className="text-lg text-primary-foreground/80 leading-relaxed">
                  Smart, safe, and inspiring journeys built just for you.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleNext}
              size="lg"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold py-4 text-lg animate-scale-in"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Quick Setup */}
      {currentStep === 1 && (
        <div className="flex-1 flex flex-col justify-center p-6">
          <StepIndicator />
          
          <Card className="max-w-md mx-auto p-6 shadow-strong animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Tell us about you</h2>
              <p className="text-muted-foreground">We'll personalize your experience.</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="transition-all focus:scale-[1.02]"
                />
              </div>

              {/* Email or Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact">Email or Phone</Label>
                <Input 
                  id="contact"
                  value={formData.emailOrPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                  placeholder="Enter email or phone"
                  className="transition-all focus:scale-[1.02]"
                />
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-2 hover:scale-[1.02] transition-all"
                  onClick={() => {/* Google login logic */}}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 hover:scale-[1.02] transition-all"
                  onClick={() => {/* Facebook login logic */}}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleNext}
              className={cn(
                "w-full mt-6 font-bold hover:scale-[1.02] transition-all",
                isStepValid() 
                  ? "bg-gradient-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              size="lg"
              disabled={!isStepValid()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      )}

      {/* Step 3: OTP Verification */}
      {currentStep === 2 && (
        <div className="flex-1 flex flex-col justify-center p-6">
          <StepIndicator />
          
          <Card className="max-w-md mx-auto p-6 shadow-strong animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Verify your account</h2>
              <p className="text-muted-foreground">
                We sent a 4-digit code to<br />
                <span className="font-medium text-foreground">{formData.emailOrPhone}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Demo OTP: <span className="font-mono font-semibold text-primary">1234</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={formData.otp}
                  onChange={(value) => setFormData(prev => ({ ...prev, otp: value }))}
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2 rounded-lg transition-all focus:scale-110" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2 rounded-lg transition-all focus:scale-110" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2 rounded-lg transition-all focus:scale-110" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2 rounded-lg transition-all focus:scale-110" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Didn't get it? <span className="font-medium">Resend OTP</span>
                </button>
              </div>
            </div>

            <Button 
              onClick={handleNext}
              className="w-full mt-8 bg-gradient-primary text-primary-foreground font-bold hover:scale-[1.02] transition-all"
              size="lg"
              disabled={!isStepValid()}
            >
              Verify & Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {formData.otp.length === 4 && formData.otp !== "1234" && (
              <p className="text-xs text-destructive text-center mt-2">
                Invalid OTP. Please use demo OTP: 1234
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Step 4: Preferences & Language */}
      {currentStep === 3 && (
        <div className="flex-1 flex flex-col justify-center p-6">
          <StepIndicator />
          
          <Card className="max-w-md mx-auto p-6 shadow-strong animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Make it yours</h2>
              <p className="text-muted-foreground">
                Choose what matters most for your solo journeys.
              </p>
            </div>

            <div className="space-y-6">
              {/* Multi-select chips */}
              <div className="grid grid-cols-2 gap-3">
                {preferences.map((pref) => {
                  const Icon = pref.icon;
                  const isSelected = formData.preferences.includes(pref.id);
                  
                  return (
                     <button
                       key={pref.id}
                       onClick={() => togglePreference(pref.id)}
                       className={cn(
                         "p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105",
                         isSelected
                           ? `${pref.colorScheme.selected} shadow-lg`
                           : `border-border ${pref.colorScheme.hover}`
                       )}
                     >
                       <div className="flex flex-col items-center space-y-2">
                         <div className={cn(
                           "p-2 rounded-lg transition-all",
                           isSelected ? pref.colorScheme.iconBg : "bg-muted"
                         )}>
                           <Icon className={cn(
                             "w-5 h-5",
                             pref.id === "safety" && isSelected && "animate-pulse",
                             pref.id === "community" && isSelected && "animate-bounce",
                             pref.id === "budget" && isSelected && "animate-spin slow",
                             pref.id === "flexibility" && isSelected && "animate-[wiggle_1s_ease-in-out_infinite]"
                           )} />
                         </div>
                         <div className="text-center">
                           <div className="font-medium text-xs">{pref.label}</div>
                         </div>
                       </div>
                     </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Language Dropdown */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="transition-all focus:scale-[1.02]">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Permission Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-sm">Enable Location</div>
                  <div className="text-xs text-muted-foreground">
                    Connect with nearby travelers & get safety alerts
                  </div>
                </div>
                <Switch
                  checked={formData.locationEnabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, locationEnabled: checked }))
                  }
                />
              </div>
            </div>

            <Button 
              onClick={() => onComplete(formData)}
              className={cn(
                "w-full mt-8 font-bold hover:scale-[1.02] transition-all",
                isStepValid() 
                  ? "bg-gradient-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              size="lg"
              disabled={!isStepValid()}
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;