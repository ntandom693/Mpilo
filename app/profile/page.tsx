"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function go() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      // Not logged in: log in first, then come back here
      if (!user) {
        router.replace(`/login?returnTo=${encodeURIComponent("/profile")}`);
        return;
      }

      // Logged in: make sure they have a profile (Google users won't yet)
      const { data: existing } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const meta = user.user_metadata || {};
        const fullName = (meta.full_name || meta.name || "").trim();
        const parts = fullName.split(" ");

        await supabase.from("profiles").insert({
          user_id: user.id,
          first_name: meta.given_name || parts[0] || "",
          last_name: meta.family_name || parts.slice(1).join(" ") || "",
          avatar_url: meta.avatar_url || meta.picture || null,
        });
      }

      router.replace(`/profile/${user.id}`);
    }

    go();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <p className="text-sm text-[#8B8E97]">Loading your profile...</p>
    </main>
  );
}
