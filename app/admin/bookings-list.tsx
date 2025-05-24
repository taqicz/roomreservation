import { getSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import ManageBookingButtons from "./manage-booking-buttons"

async function getBookings() {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      rooms:room_id (
        id,
        name,
        location
      ),
      profiles:user_id (
        id,
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return data
}

export default async function BookingsList() {
  const bookings = await getBookings()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.event_name}</h3>
                      <p className="text-sm text-gray-500">
                        {booking.rooms.name} - {booking.rooms.location}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Booking Details</p>
                      <p className="text-sm">
                        <span className="font-medium">Start:</span> {formatDate(booking.start_time)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">End:</span> {formatDate(booking.end_time)}
                      </p>
                      {booking.description && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Description:</span> {booking.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">User Information</p>
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {booking.profiles.full_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {booking.profiles.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Requested:</span>{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex space-x-2 pt-2">
                      <ManageBookingButtons bookingId={booking.id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
