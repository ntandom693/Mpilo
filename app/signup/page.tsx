"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Camera, Check } from "lucide-react";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/feed";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];

    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    let avatarUrl = null;

    if (file && data.user) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(fileName);

        avatarUrl = publicUrlData.publicUrl;
      }
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      });
    }

    setLoading(false);
    router.push(returnTo);
  }

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "";

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

      <div className="w-full max-w-sm mx-auto pt-10 pb-10">

        {/* Intro */}
        <div>
          <p className="text-sm font-medium text-[#8B8E97]">
            WELCOME
          </p>

          <h1 className="mt-2 text-[34px] leading-[1.08] font-semibold tracking-[-0.04em]">
            Make yourself
            <br />
            at home.
          </h1>

          <p className="mt-4 text-[15px] leading-6 text-[#6F727B] max-w-[320px]">
            Create your Denverr account and find your place on campus.
          </p>
        </div>

        {/* Profile photo */}
        <div className="flex items-center gap-4 mt-9">

          <div className="relative w-[72px] h-[72px] shrink-0">

            <div className="w-full h-full rounded-full bg-[#111318] overflow-hidden flex items-center justify-center">

              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-semibold">
                  {firstName.charAt(0).toUpperCase() || "D"}
                </span>
              )}

            </div>

            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center cursor-pointer shadow-sm">
              <Camera size={14} />

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

          </div>

          <div>
            <p className="text-sm font-semibold">
              Your profile photo
            </p>

            <p className="text-xs text-[#8B8E97] mt-1">
              Optional for now
            </p>
          </div>

        </div>

        {/* Form */}
        <div className="mt-9 space-y-5">

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-xs font-semibold text-[#6F727B]">
                First name
              </label>

              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F727B]">
                Last name
              </label>

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Mokoena"
                className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
              />
            </div>

          </div>

          <div>
            <label className="text-xs font-semibold text-[#6F727B]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
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
              placeholder="At least 6 characters"
              className="w-full mt-2 bg-white border border-[#E7E8EC] rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#111318] transition placeholder:text-[#B0B2B8]"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-[#FFF1F1] border border-[#FFD6D6] px-4 py-3">
              <p className="text-sm text-[#C62828]">
                {error}
              </p>
            </div>
          )}

        </div>

        {/* Create account */}
        <button
          onClick={handleSignUp}
          disabled={!canSubmit || loading}
          className="mt-7 w-full bg-[#111318] text-white py-4 rounded-2xl font-semibold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99] transition"
        >
          {loading ? "Creating your account..." : "Create account"}
        </button>

        {/* Login */}
        <p className="text-center text-sm text-[#7A7D85] mt-5">
          Already on Denverr?{" "}
          <a
            href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="text-[#111318] font-semibold"
          >
            Log in
          </a>
        </p>

        {/* Terms */}
        <p className="text-center text-[11px] leading-5 text-[#9A9DA5] mt-7 px-3">
          By creating an account, you agree to our{" "}
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