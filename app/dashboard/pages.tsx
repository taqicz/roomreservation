"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { CalendarDays, Home, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Booking {
  id: number;
  event_name: string;
  status: string;
  rooms?: {
    id: number;
    name: string;
    location: string;
  };
}

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);

        // Load recent bookings
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(
            `
            id,
            event_name,
            status,
            rooms:room_id (
              id,
              name,
              location
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (bookingsData) {
          setBookings(bookingsData as Booking[]);
        }

        // Load available rooms
        const { data: roomsData } = await supabase.from("rooms").select("id, name, location, capacity").eq("is_available", true).order("name").limit(3);

        if (roomsData) {
          setRooms(roomsData as Room[]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading, router, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || user.email}</h1>
          <p className="text-gray-500 mt-2">Manage your room reservations and bookings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/rooms">
                    <Home className="mr-2 h-4 w-4" />
                    Browse Rooms
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/bookings">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                {profile?.user_role === "admin" && (
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Recent Bookings</CardTitle>
              <CardDescription>Your latest room reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">You don't have any bookings yet.</p>
                  <Button asChild className="mt-2" variant="outline" size="sm">
                    <Link href="/rooms">Book a Room</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-3 border rounded-md">
                      <div className="font-medium">{booking.event_name}</div>
                      <div className="text-sm text-gray-500">{booking.rooms?.name || "Unknown Room"}</div>
                      <div className="text-sm mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                            booking.status === "approved" ? "bg-green-100 text-green-800" : booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button asChild className="w-full" variant="outline" size="sm">
                    <Link href="/bookings">View All Bookings</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Available Rooms</CardTitle>
              <CardDescription>Rooms you can book now</CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No rooms available at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-3 border rounded-md">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-gray-500">{room.location}</div>
                      <div className="text-sm mt-1">Capacity: {room.capacity}</div>
                    </div>
                  ))}
                  <Button asChild className="w-full" variant="outline" size="sm">
                    <Link href="/rooms">View All Rooms</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
