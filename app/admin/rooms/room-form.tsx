"use client";

import { Alert } from "@/components/ui/alert";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For debugging: ensure this is triggered!
      console.log("Submitting form:", {
        name,
        capacity,
        location,
        description,
        imageUrl,
        isAvailable,
      });

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

      // For debugging: show the payload
      console.log("Room data to send:", roomData);

      const response = await fetch("/api/admin/rooms", {
        method: room ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(room ? { ...roomData, id: room.id } : roomData),
      });

      // For debugging: check response status
      console.log("API response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        // For debugging: show error from API
        console.error("API error:", data.error);
        throw new Error(data.error || "Gagal menyimpan data ruangan");
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
      <div>
        <label className="block font-medium">Nama Ruangan</label>
        <input className="border px-2 py-1 rounded w-full" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium">Kapasitas</label>
        <input className="border px-2 py-1 rounded w-full" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium">Lokasi</label>
        <input className="border px-2 py-1 rounded w-full" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium">Deskripsi</label>
        <textarea className="border px-2 py-1 rounded w-full" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </div>
      <div>
        <label className="block font-medium">URL Gambar</label>
        <input className="border px-2 py-1 rounded w-full" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is-available" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
        <label htmlFor="is-available">Tersedia</label>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700" disabled={loading}>
        {loading ? "Menyimpan..." : room ? "Update Room" : "Add Room"}
      </button>
    </form>
  );
}
