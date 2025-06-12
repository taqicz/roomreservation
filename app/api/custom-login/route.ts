import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = "34qk1@*k@^*o)ptplj0-xo1)!yzyojv(8$$os&joiei1cho63b";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Demo: hanya satu admin hardcode
  if (email === "admin@gmail.com" && password === "admin123") {
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60,
    });
    return res;
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
