"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Room } from "@/lib/supabase/types"

interface RoomFormProps {
  room?: Room
}

export default function RoomForm({ room }: RoomFormProps) {
  const [name, setName] = useState(room?.name || "")
  const [capacity, setCapacity] = useState(room?.capacity?.toString() || "")
  const [location, setLocation] = useState(room?.location || "")
  const [description, setDescription] = useState(room?.description || "")
  const [imageUrl, setImageUrl] = useState(room?.image_url || "")
  const [isAvailable, setIsAvailable] = useState(room?.is_available ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const roomData = {
        name,
        capacity: Number.parseInt(capacity),
        location,
        description,
        image_url: imageUrl,
        is_available: isAvailable,
      }

      if (isNaN(roomData.capacity) || roomData.capacity <= 0) {
        throw new Error("Capacity must be a positive number")
      }

      if (room) {
        // Update existing room
        const { error } = await supabase.from("rooms").update(roomData).eq("id", room.id)

        if (error) throw error
      } else {
        // Create new room
        const { error } = await supabase.from("rooms").insert(roomData)

        if (error) throw error
      }

      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Room Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-sm text-gray-500">Leave empty to use a placeholder image</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isAvailable" checked={isAvailable} onCheckedChange={setIsAvailable} />
        <Label htmlFor="isAvailable">Available for booking</Label>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : room ? "Update Room" : "Create Room"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
