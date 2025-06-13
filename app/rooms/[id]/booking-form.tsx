"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function BookingForm({ roomId }: { roomId: number }) {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check CAPTCHA
      if (!captchaToken) {
        setError("Please complete the reCAPTCHA!");
        setLoading(false);
        return;
      }

      // Verify CAPTCHA with backend
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

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Validate dates
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (startDateTime >= endDateTime) {
        throw new Error("End time must be after start time");
      }

      if (startDateTime < new Date()) {
        throw new Error("Start time cannot be in the past");
      }

      // Check for conflicting bookings
      const { data: conflictingBookings, error: conflictError } = await supabase
        .from("bookings")
        .select("*")
        .eq("room_id", roomId)
        .eq("status", "approved")
        .or(`start_time.lte.${endDateTime.toISOString()},end_time.gte.${startDateTime.toISOString()}`);

      if (conflictError) throw conflictError;

      if (conflictingBookings && conflictingBookings.length > 0) {
        throw new Error("This room is already booked for the selected time period");
      }

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        room_id: roomId,
        user_id: user.id,
        event_name: eventName,
        description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: "pending",
      });

      if (bookingError) throw bookingError;

      setSuccess("Booking request submitted successfully! An administrator will review your request.");

      // Reset form
      setEventName("");
      setDescription("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setCaptchaToken(null);

      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while submitting your booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="eventName">Event Name</Label>
          <Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Event Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={handleCaptchaChange} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Book Room"}
        </Button>
      </form>
    </Card>
  );
}
