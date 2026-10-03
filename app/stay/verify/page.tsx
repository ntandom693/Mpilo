"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Verify() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleVerify() {
    // No real code is checked yet — this just simulates verification for now.
    // Later, this is where we'll check a real code sent to their student email.
    router.push("/stay/room");
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 flex flex-col items-center">

      <div className="w-full max-w-sm text-center">

        <h1 className="text-2xl font-bold">
          Check your email
        </h1>

        <p className="text-[#6B7280] mt-2">
          We sent a 6-digit code to your UFS student email. Enter it below to verify you're a real student.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="w-full mt-6 bg-white border border-[#E5E7EB] rounded-xl p-3 text-center text-lg tracking-widest focus:outline-none focus:border-[#4F46E5]"
        />

        <button
          onClick={handleVerify}
          disabled={code.trim() === ""}
          className="mt-6 w-full bg-[#4F46E5] text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4338CA] transition"
        >
          Verify
        </button>

      </div>

    </main>
  );
}