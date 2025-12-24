import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plane, Compass, Mail, Phone } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 digits");
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, "Please enter a valid phone number with country code");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    const newErrors: { email?: string; phone?: string; password?: string } = {};
    
    if (authMethod === "email") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    } else {
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        newErrors.phone = phoneResult.error.errors[0].message;
      }
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (authMethod === "email") {
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
      } else {
        // Phone auth
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({
            phone,
            password,
          });
          
          if (error) {
            toast({
              title: "Login failed",
              description: error.message.includes("Invalid login credentials") 
                ? "Invalid phone number or password. Please try again."
                : error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Welcome back!",
              description: "You've successfully logged in.",
            });
          }
        } else {
          const { error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
              data: {
                display_name: displayName,
              },
            },
          });
          
          if (error) {
            if (error.message.includes("User already registered")) {
              toast({
                title: "Account exists",
                description: "An account with this phone number already exists. Please login instead.",
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Plane className="w-16 h-16 text-primary animate-bounce" style={{ animationDuration: "3s" }} />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <Compass className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: "10s" }} />
      </div>
      <div className="absolute top-1/3 right-20 opacity-20">
        <MapPin className="w-10 h-10 text-accent-foreground" />
      </div>

      <Card className="w-full max-w-md border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Join Roamio"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin
              ? "Sign in to continue your journey"
              : "Create an account to start exploring"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-6 border-border hover:bg-muted/50"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="font-medium">Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Auth Method Tabs */}
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background border-border focus:border-primary"
                  />
                </div>
              )}

              <TabsContent value="email" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`bg-background border-border focus:border-primary ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="phone" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={`bg-background border-border focus:border-primary ${errors.phone ? "border-destructive" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`bg-background border-border focus:border-primary ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </Tabs>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
