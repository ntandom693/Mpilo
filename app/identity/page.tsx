"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    router.push("/feed");
  }

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "";
    
  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 flex flex-col items-center justify-center relative">

      <Link href="/" className="absolute top-6 left-6 text-[#6B7280] text-2xl">
        ✕
      </Link>

      <div className="w-full max-w-sm">

        <h1 className="text-2xl font-bold text-center">
          Create your account
        </h1>

        <p className="text-[#6B7280] text-center mt-2">
          Join Denverr to post, engage, and connect with other students.
        </p>

        {/* Profile photo */}
        <div className="flex flex-col items-center mt-6">
          <div className="w-20 h-20 rounded-full bg-[#E0E7FF] flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#4F46E5] text-2xl font-semibold">
                {firstName.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <label className="mt-3 text-sm font-medium text-[#4F46E5] cursor-pointer">
            {preview ? "Change photo" : "Add profile photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Mokoena"
              className="w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@gmail.com"
              className="w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        <button
          onClick={handleSignUp}
          disabled={!canSubmit || loading}
          className="mt-6 w-full bg-[#4F46E5] text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4338CA] transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-[#6B7280] text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#4F46E5] font-medium">
            Log in
          </a>
        </p>

      </div>

    </main>
  );
}