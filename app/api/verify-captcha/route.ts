import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { captchaToken } = await req.json();
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!captchaToken || !secret) {
      return NextResponse.json({ success: false, error: "Missing CAPTCHA token or server secret" }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", captchaToken);

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await verifyRes.json();

    if (!data.success) {
      return NextResponse.json({ success: false, error: "CAPTCHA verification failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
