"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Only allow pages inside our own app (safety check)
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/feed";

  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(returnTo);
  }

  async function handleGoogle() {
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${returnTo}`,
      },
    });

    if (error) setError(error.message);
  }

  const canSubmit = email.trim() !== "" && password.trim() !== "";

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] px-5 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href={returnTo}>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center active:scale-95 transition"
          >
            <ArrowLeft size={19} />
          </button>
        </Link>

        <span className="text-[15px] font-semibold tracking-[-0.02em]">
          Denverr
        </span>

        <div className="w-10" />
      </div>

      <div className="w-full max-w-sm mx-auto pt-16 pb-10">
        {/* Intro */}
        <div>
          <p className="text-sm font-medium text-[#8B8E97]">WELCOME BACK</p>

          <h1 className="mt-2 text-[36px] leading-[1.05] font-semibold tracking-[-0.045em]">
            Good to see
            <br />
            you again.
          </h1>

          <p className="mt-4 text-[15px] leading-6 text-[#6F727B]">
            Pick up where you left off.
          </p>
        </div>

        {/* Form */}
        <div className="mt-10 space-y-5">
          <div>
            <label className="text-xs font-semibold text-[#6F727B]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-4 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6F727B]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-4 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-[#FFF1F1] border border-[#FFD6D6] px-4 py-3">
              <p className="text-sm text-[#C62828]">{error}</p>
            </div>
          )}
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={!canSubmit || loading}
          className="mt-7 w-full bg-[#111318] text-white py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99] transition"
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              Log in
              <ArrowRight size={17} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 h-px bg-[#E7E8EC]" />
          <span className="text-xs text-[#9A9DA5]">or</span>
          <div className="flex-1 h-px bg-[#E7E8EC]" />
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="mt-6 w-full bg-white border border-[#E7E8EC] text-[#111318] py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          Continue with Google
        </button>

        {/* Signup */}
        <p className="text-center text-sm text-[#7A7D85] mt-6">
          New to Denverr?{" "}
          <a
            href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
            className="text-[#111318] font-semibold"
          >
            Create an account
          </a>
        </p>

        {/* Terms */}
        <p className="text-center text-[11px] leading-5 text-[#9A9DA5] mt-8 px-3">
          By logging in, you agree to our{" "}
          <a href="/terms" className="text-[#111318] font-medium">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[#111318] font-medium">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
