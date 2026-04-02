import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { MapPin, Plane, Compass, Users, Shield, Globe, ArrowRight } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Roamio! You can now start exploring.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col lg:flex-row">
      {/* Left: Value Prop Panel (visible on larger screens, collapsed on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-10 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-md mx-auto space-y-8">
          <div>
            <img
              src="/og-image.jpg"
              alt="Roamio Logo"
              className="w-20 h-20 rounded-2xl object-cover shadow-lg mb-6"
            />
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              Find your perfect<br />travel crew
            </h1>
            <p className="text-lg text-muted-foreground mt-3">
              Join thousands of travelers matching with like-minded explorers for unforgettable group adventures.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Smart Group Matching</p>
                <p className="text-sm text-muted-foreground">Get matched with travelers who share your interests, budget, and travel style.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Verified & Safe</p>
                <p className="text-sm text-muted-foreground">Every member is verified. Built-in safety features including SOS alerts and parental controls.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Plan Together, Effortlessly</p>
                <p className="text-sm text-muted-foreground">Group chat, expense splitting, polls, and shared itineraries — all in one place.</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span> travelers already exploring together
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {/* Decorative elements — mobile only */}
        <div className="absolute top-20 left-10 opacity-20 lg:hidden">
          <Plane className="w-12 h-12 text-primary animate-bounce" style={{ animationDuration: "3s" }} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 lg:hidden">
          <Compass className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: "10s" }} />
        </div>

        <Card className="w-full max-w-md border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Show logo on mobile only */}
            <img
              src="/og-image.jpg"
              alt="Roamio Logo"
              className="mx-auto mb-3 w-16 h-16 rounded-2xl object-cover shadow-lg lg:hidden"
            />
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Start exploring"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin
                ? "Sign in to continue your journey"
                : "Create your free account in seconds"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-foreground text-sm">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="What should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background border-border focus:border-primary h-11"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`bg-background border-border focus:border-primary h-11 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`bg-background border-border focus:border-primary h-11 ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                {!isLogin && <p className="text-xs text-muted-foreground">Minimum 6 characters</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Free Account"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Trust signals below CTA */}
            {!isLogin && (
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Free forever</span>
                <span>•</span>
                <span>No credit card</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up free" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Mobile-only social proof */}
            <div className="lg:hidden pt-3 border-t border-border">
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> travelers joined
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
