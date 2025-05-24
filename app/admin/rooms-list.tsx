import Link from "next/link"
import Image from "next/image"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import DeleteRoomButton from "./delete-room-button"

async function getRooms() {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from("rooms").select("*").order("name")

  if (error) {
    console.error("Error fetching rooms:", error)
    return []
  }

  return data
}

export default async function RoomsList() {
  const rooms = await getRooms()

  return (
    <div className="space-y-4">
      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No rooms available. Add a room to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/rooms/new">Add Room</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative h-32 w-full md:w-48 rounded-md overflow-hidden">
                    <Image
                      src={room.image_url || "/placeholder.svg?height=200&width=200"}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <p className="text-sm text-gray-500">{room.location}</p>
                      </div>
                      <Badge variant={room.is_available ? "default" : "secondary"}>
                        {room.is_available ? "Available" : "Not Available"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">Capacity:</span> {room.capacity}
                    </p>
                    <div className="flex space-x-2 pt-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/rooms/${room.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteRoomButton roomId={room.id} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
