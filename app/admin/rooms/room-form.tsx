import { Alert } from "@/components/ui/alert";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Utility input sanitizer
function sanitizeInput(input: string) {
  // Remove leading/trailing spaces and encode HTML special chars
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

export default function RoomForm({ room }: { room?: any }) {
  const [name, setName] = useState(room?.name || "");
  const [capacity, setCapacity] = useState(room?.capacity?.toString() || "");
  const [location, setLocation] = useState(room?.location || "");
  const [description, setDescription] = useState(room?.description || "");
  const [imageUrl, setImageUrl] = useState(room?.image_url || "");
  const [isAvailable, setIsAvailable] = useState(room?.is_available ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validasi input ketat
      const cleanName = sanitizeInput(name);
      if (cleanName.length < 3 || cleanName.length > 50) {
        throw new Error("Room name must be 3-50 characters.");
      }
      const numCapacity = Number.parseInt(capacity);
      if (isNaN(numCapacity) || numCapacity <= 0 || numCapacity > 500) {
        throw new Error("Capacity must be a positive number not more than 500.");
      }
      const cleanLocation = sanitizeInput(location);
      if (cleanLocation.length < 2 || cleanLocation.length > 100) {
        throw new Error("Location must be 2-100 characters.");
      }
      const cleanDescription = sanitizeInput(description);
      if (cleanDescription.length > 500) {
        throw new Error("Description must not exceed 500 characters.");
      }
      const cleanImageUrl = sanitizeInput(imageUrl);
      // Optionally: Validasi url gambar (minimal cek ekstensi)
      if (cleanImageUrl && !/^.+\.(jpg|jpeg|png|svg)$/i.test(cleanImageUrl)) {
        throw new Error("Image URL must be a valid image file (jpg, jpeg, png, svg).");
      }

      const roomData = {
        name: cleanName,
        capacity: numCapacity,
        location: cleanLocation,
        description: cleanDescription,
        image_url: cleanImageUrl,
        is_available: isAvailable,
      };

      if (room) {
        // Update existing room
        const { error } = await supabase.from("rooms").update(roomData).eq("id", room.id);

        if (error) throw error;
      } else {
        // Create new room
        const { error } = await supabase.from("rooms").insert(roomData);

        if (error) throw error;
      }

      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Alert>
      )}
      {/* ...rest of your form fields... */}
    </form>
  );
}
