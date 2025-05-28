import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Calendar, Home, PlusCircle } from "lucide-react";
import Link from "next/link";
import BookingsList from "./bookings-list";
import RoomsList from "./rooms-list";

export const revalidate = 0; // Don't cache this page

async function checkAdminAccess() {
  const supabase = getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase.from("profiles").select("user_role").eq("id", user.id).single();

  if (error || !data) {
    return false;
  }

  return data.user_role === "admin";
}

export default async function AdminPage() {
  const isAdmin = await checkAdminAccess();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage rooms and bookings</p>
          </div>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/admin/rooms/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Room
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <RoomCount />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <PendingBookingsCount />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <TotalBookingsCount />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms" className="space-y-4">
            <RoomsList />
          </TabsContent>
          <TabsContent value="bookings" className="space-y-4">
            <BookingsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

async function RoomCount() {
  const supabase = getSupabaseServer();
  const { count, error } = await supabase.from("rooms").select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching room count:", error);
    return 0;
  }

  return count || 0;
}

async function PendingBookingsCount() {
  const supabase = getSupabaseServer();
  const { count, error } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");

  if (error) {
    console.error("Error fetching pending bookings count:", error);
    return 0;
  }

  return count || 0;
}

async function TotalBookingsCount() {
  const supabase = getSupabaseServer();
  const { count, error } = await supabase.from("bookings").select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total bookings count:", error);
    return 0;
  }

  return count || 0;
}
