import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Room } from "@/lib/supabase/types";
import { MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

async function getRooms(): Promise<Room[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("rooms").select("*").order("name");

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return data || [];
}

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Available Rooms</h1>
          <p className="text-gray-500 mt-2">Browse and book rooms for your events</p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No rooms available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: Room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={room.image_url || "/placeholder.svg?height=200&width=400"} alt={room.name} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold">{room.name}</h2>
                  <div className="flex items-center mt-2 text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{room.location}</span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">Capacity: {room.capacity}</span>
                  </div>
                  <p className="mt-4 text-gray-600 line-clamp-2">{room.description}</p>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/rooms/${room.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
