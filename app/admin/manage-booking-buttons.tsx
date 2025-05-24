"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export default function ManageBookingButtons({ bookingId }: { bookingId: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    setLoading(true)
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error(`Error ${status === "approved" ? "approving" : "rejecting"} booking:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => handleUpdateStatus("approved")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        <Check className="mr-2 h-4 w-4" />
        Approve
      </Button>
      <Button onClick={() => handleUpdateStatus("rejected")} disabled={loading} variant="destructive">
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>
    </>
  )
}
