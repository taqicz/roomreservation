import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import RoomForm from "../room-form"

export const revalidate = 0 // Don't cache this page

async function checkAdminAccess() {
  const supabase = getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase.from("profiles").select("user_role").eq("id", user.id).single()

  if (error || !data) {
    return false
  }

  return data.user_role === "admin"
}

export default async function NewRoomPage() {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Room</h1>
          <p className="text-gray-500 mt-2">Create a new room for booking</p>
        </div>

        <RoomForm />
      </div>
    </div>
  )
}
