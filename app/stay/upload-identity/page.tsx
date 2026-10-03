"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadIdentity() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleContinue() {
    router.push("/stay/upload");
  }

  const canContinue = name.trim() !== "" && email.trim() !== "";

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 flex flex-col items-center">

      <div className="w-full max-w-sm">

        <h1 className="text-2xl font-bold text-center">
          Create your identity
        </h1>

        <p className="text-[#6B7280] text-center mt-2">
          Set up your identity before listing a room, so students know who they're renting from.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Mokoena"
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
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="mt-6 w-full bg-[#4F46E5] text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4338CA] transition"
        >
          Continue
        </button>

      </div>

    </main>
  );
}