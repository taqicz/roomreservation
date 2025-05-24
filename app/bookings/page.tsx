import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Booking, Room } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import CancelBookingButton from "./cancel-booking-button";

export const revalidate = 0; // Don't cache this page

interface BookingWithRoom extends Booking {
  rooms: Pick<Room, "id" | "name" | "location">;
}

async function getUserBookings(): Promise<BookingWithRoom[] | null> {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      rooms:room_id (
        id,
        name,
        location
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data as BookingWithRoom[];
}

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  if (bookings === null) {
    redirect("/auth");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500 mt-2">View and manage your room bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You don't have any bookings yet.</p>
            <Button asChild className="mt-4">
              <a href="/rooms">Browse Rooms</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking: BookingWithRoom) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{booking.event_name}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{booking.rooms.name}</p>
                    <p className="text-sm text-gray-500">{booking.rooms.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Start:</span> {formatDate(booking.start_time)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">End:</span> {formatDate(booking.end_time)}
                    </p>
                  </div>
                  {booking.description && <p className="text-sm text-gray-600 line-clamp-3">{booking.description}</p>}
                </CardContent>
                <CardFooter>{booking.status === "pending" && <CancelBookingButton bookingId={booking.id} />}</CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
