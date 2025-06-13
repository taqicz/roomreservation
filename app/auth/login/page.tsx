"use client";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Rate limit state
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const router = useRouter();

  // Restore attempts/lock from localStorage on mount
  useEffect(() => {
    const savedAttempts = Number(localStorage.getItem("loginAttempts") || 0);
    const savedLockedUntil = Number(localStorage.getItem("loginLockedUntil") || 0);
    setAttempts(savedAttempts);
    if (savedLockedUntil > Date.now()) {
      setLockedUntil(savedLockedUntil);
    }
  }, []);

  // Save attempts/lock to localStorage when changed
  useEffect(() => {
    localStorage.setItem("loginAttempts", attempts.toString());
    if (lockedUntil) {
      localStorage.setItem("loginLockedUntil", lockedUntil.toString());
    } else {
      localStorage.removeItem("loginLockedUntil");
    }
  }, [attempts, lockedUntil]);

  // Countdown for lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (lockedUntil <= now) {
        setLockedUntil(null);
        setAttempts(0);
        setSecondsLeft(0);
      } else {
        setSecondsLeft(Math.ceil((lockedUntil - now) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Cek rate limit (blokir submit jika masih dalam masa locked)
    if (lockedUntil && lockedUntil > Date.now()) {
      setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${secondsLeft} detik.`);
      setLoading(false);
      return;
    }

    // Cek captcha
    if (!captchaToken) {
      setError("Please complete the reCAPTCHA!");
      setLoading(false);
      return;
    }

    // Verifikasi captcha ke backend
    const captchaRes = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captchaToken }),
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      setError("CAPTCHA verification failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      setAttempts(0);
      setLockedUntil(null);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("loginLockedUntil");
      router.push("/admin");
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockedUntil(until);
        setError(`Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${LOCKOUT_SECONDS} detik.`);
      } else {
        setError("Login gagal: " + error.message);
      }
    }
    setLoading(false);
  };

  const disabled = loading || !!lockedUntil;

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" disabled={disabled} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" disabled={disabled} />
      <div style={{ margin: "12px 0" }}>
        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={(token) => setCaptchaToken(token)} />
      </div>
      <button type="submit" disabled={disabled}>
        {loading ? "Memproses..." : "Login"}
      </button>
      {lockedUntil && <div style={{ color: "orange", marginTop: 8 }}>Anda diblokir sementara. Coba lagi dalam {secondsLeft} detik.</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
