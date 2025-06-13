"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha"; // <-- Tambahkan ini

// Utility password validation function
function isStrongPassword(pw: string) {
  // At least 8 chars, 1 upper, 1 lower, 1 number, 1 symbol
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/.test(pw);
}

// Utility input sanitizer
function sanitizeInput(input: string) {
  // Remove leading/trailing spaces and encode HTML special chars
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 7200;

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = getSupabaseBrowser();

  // reCAPTCHA state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Rate limit state (Sign In only)
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Restore attempts/lock from localStorage on mount
  useEffect(() => {
    const savedAttempts = Number(localStorage.getItem("loginAttempts") || 0);
    const savedLockedUntil = Number(localStorage.getItem("loginLockedUntil") || 0);
    setAttempts(savedAttempts);
    if (savedLockedUntil > Date.now()) {
      setLockedUntil(savedLockedUntil);
    }
  }, []);

  // Save attempts/lock to localStorage when changed
  useEffect(() => {
    localStorage.setItem("loginAttempts", attempts.toString());
    if (lockedUntil) {
      localStorage.setItem("loginLockedUntil", lockedUntil.toString());
    } else {
      localStorage.removeItem("loginLockedUntil");
    }
  }, [attempts, lockedUntil]);

  // Countdown for lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (lockedUntil <= now) {
        setLockedUntil(null);
        setAttempts(0);
        setSecondsLeft(0);
      } else {
        setSecondsLeft(Math.ceil((lockedUntil - now) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Cek rate limit
    if (lockedUntil && lockedUntil > Date.now()) {
      setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${secondsLeft} detik.`);
      setLoading(false);
      return;
    }

    // Cek reCAPTCHA
    if (!captchaToken) {
      setError("Please complete the reCAPTCHA!");
      setLoading(false);
      return;
    }

    // Verifikasi captcha ke backend
    const captchaRes = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captchaToken }),
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      setError("CAPTCHA verification failed. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Sanitize email
      const cleanEmail = sanitizeInput(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        if (nextAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          setLockedUntil(until);
          setError(`Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${LOCKOUT_SECONDS} detik.`);
        } else {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please check your credentials.");
          } else {
            setError(error.message || "An error occurred during sign in");
          }
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccess("Successfully signed in! Redirecting...");
        setAttempts(0);
        setLockedUntil(null);
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("loginLockedUntil");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!email || !password || !fullName) {
        throw new Error("Please fill in all fields");
      }

      // Validasi email
      const emailTrimmed = sanitizeInput(email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        throw new Error("Please enter a valid email address");
      }
      // Validasi password
      if (!isStrongPassword(password)) {
        throw new Error("Password must be at least 8 characters with uppercase, lowercase, number, and symbol.");
      }
      // Validasi fullname (hanya huruf dan spasi, max 50)
      const cleanFullName = sanitizeInput(fullName);
      if (!/^[A-Za-z\s]{2,50}$/.test(cleanFullName)) {
        throw new Error("Full Name should be 2-50 characters and only contain letters and spaces.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailTrimmed,
        password,
        options: {
          data: {
            full_name: cleanFullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
        throw error;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          setSuccess("Account created! Please check your email for a confirmation link.");
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const signinDisabled = loading || !!lockedUntil;

  return (
    <Tabs defaultValue="signin" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Sign in to your account to book rooms</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              {lockedUntil && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Anda diblokir sementara. Coba lagi dalam {secondsLeft} detik.</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={signinDisabled} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={signinDisabled} />
              </div>
              <div className="space-y-2">
                {/* reCAPTCHA v2 */}
                <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={(token) => setCaptchaToken(token)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={signinDisabled}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account to start booking rooms</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full Name</Label>
                <Input id="signup-fullname" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="At least 8 chars, uppercase, lowercase, number, symbol" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
