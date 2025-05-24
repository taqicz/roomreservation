import { getSupabaseServer } from "@/lib/supabase/server";
import type { Room } from "@/lib/supabase/types";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingForm from "./booking-form";

export const revalidate = 3600; // Revalidate every hour

async function getRoom(id: string): Promise<Room | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single();

  if (error || !data) {
    return null;
  }

  return data;
}

interface PageProps {
  params: { id: string };
}

export default async function RoomDetailPage({ params }: PageProps) {
  const room = await getRoom(params.id);

  if (!room) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center text-gray-500">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{room.location}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Users className="h-5 w-5 mr-1" />
                <span>Capacity: {room.capacity}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{room.is_available ? "Available" : "Not Available"}</span>
              </div>
            </div>
          </div>

          <div className="relative h-80 w-full rounded-lg overflow-hidden">
            <Image src={room.image_url || "/placeholder.svg?height=400&width=800"} alt={room.name} fill className="object-cover" />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{room.description}</p>
          </div>

          <div className="lg:hidden">
            <h2 className="text-xl font-semibold mb-4">Book This Room</h2>
            <BookingForm roomId={room.id} />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Book This Room</h2>
            <BookingForm roomId={room.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
