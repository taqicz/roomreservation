import { notFound, redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import RoomForm from "../../room-form"

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

async function getRoom(id: string) {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditRoomPage({ params }: { params: { id: string } }) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    redirect("/")
  }

  const room = await getRoom(params.id)

  if (!room) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Room</h1>
          <p className="text-gray-500 mt-2">Update room information</p>
        </div>

        <RoomForm room={room} />
      </div>
    </div>
  )
}
