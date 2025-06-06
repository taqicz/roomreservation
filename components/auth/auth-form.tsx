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
import { useState } from "react";

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

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = getSupabaseBrowser();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Sanitize email
      const cleanEmail = sanitizeInput(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials.");
        }
        throw error;
      }

      if (data.session) {
        setSuccess("Successfully signed in! Redirecting...");
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
                <Input id="signin-email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
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
