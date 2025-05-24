export interface Room {
  id: number
  name: string
  capacity: number
  location: string
  description: string
  image_url: string
  is_available: boolean
  created_at: string
}

export interface Booking {
  id: number
  room_id: number
  user_id: string
  event_name: string
  description: string
  start_time: string
  end_time: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  user_role: "admin" | "student"
  created_at: string
}
