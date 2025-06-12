import { createClient } from "@supabase/supabase-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Gunakan service key Supabase (HANYA di server)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const JWT_SECRET = "34qk1@*k@^*o)ptplj0-xo1)!yzyojv(8$$os&joiei1cho63b";

export async function POST(req: NextRequest) {
  // Cek token dari cookie
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload & { role?: string };
    if (user.role !== "admin") throw new Error("Forbidden");

    const body = await req.json();

    // Insert ke Supabase
    const { error } = await supabase.from("rooms").insert(body);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
