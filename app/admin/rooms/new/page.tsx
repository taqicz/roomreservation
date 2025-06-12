// import { getSupabaseServer } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
// import RoomForm from "../room-form";

// // Jangan cache halaman ini
// export const revalidate = 0;

// // Pastikan fungsi ini async dan gunakan await pada getSupabaseServer
// async function checkAdminAccess() {
//   const supabase = await getSupabaseServer();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return false;
//   }

//   const { data, error } = await supabase.from("profiles").select("user_role").eq("id", user.id).single();

//   if (error || !data) {
//     return false;
//   }

//   return data.user_role === "admin";
// }

// export default async function NewRoomPage() {
//   const isAdmin = await checkAdminAccess();

//   if (!isAdmin) {
//     redirect("/");
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">Add New Room</h1>
//           <p className="text-gray-500 mt-2">Create a new room for booking</p>
//         </div>

//         <RoomForm />
//       </div>
//     </div>
//   );
// }

import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RoomForm from "../room-form";

const JWT_SECRET = "34qk1@*k@^*o)ptplj0-xo1)!yzyojv(8$$os&joiei1cho63b";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload & { role?: string };
    return user;
  } catch {
    return null;
  }
}

export default async function NewRoomPage() {
  const user = await getUserFromToken();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <h1>Add New Room</h1>
      <RoomForm />
    </div>
  );
}
