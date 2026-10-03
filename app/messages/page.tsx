"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Home, Building2, User } from "lucide-react";

type Conversation = {
  listingId: number;
  listingTitle: string;
  otherId: string;
  otherName: string;
  lastMessage: string;
  unreadCount: number;
};

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        window.location.href = "/signup";
        return;
      }

      const myId = sessionData.session.user.id;

      const { data: allMessages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order("created_at", { ascending: false });

      if (!allMessages) {
        setLoading(false);
        return;
      }

      const grouped = new Map<string, Conversation>();

      for (const msg of allMessages) {
        const otherId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
        const key = `${msg.listing_id}-${otherId}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            listingId: msg.listing_id,
            listingTitle: "",
            otherId,
            otherName: "Someone",
            lastMessage: msg.content,
            unreadCount: 0,
          });
        }

        if (msg.receiver_id === myId && !msg.read) {
          grouped.get(key)!.unreadCount += 1;
        }
      }

      const conversationList = Array.from(grouped.values());

      const filledIn = await Promise.all(
        conversationList.map(async (c) => {
          const { data: listing } = await supabase
            .from("listings")
            .select("title")
            .eq("id", c.listingId)
            .single();

          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", c.otherId)
            .single();

          return {
            ...c,
            listingTitle: listing?.title || "a listing",
            otherName: profile
              ? `${profile.first_name} ${profile.last_name.charAt(0)}.`
              : "Someone",
          };
        })
      );

      setConversations(filledIn);
      setLoading(false);
    }

    loadConversations();
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 pb-24">

      <h1 className="text-3xl font-bold">
        Messages
      </h1>

      {loading && (
        <p className="text-[#6B7280] mt-6 text-center">Loading conversations...</p>
      )}

      {!loading && conversations.length === 0 && (
        <p className="text-[#6B7280] mt-6 text-center">No conversations yet.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {conversations.map((c) => (
          <Link
            href={`/messages/chat?listingId=${c.listingId}&otherId=${c.otherId}`}
            key={`${c.listingId}-${c.otherId}`}
          >
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#4F46E5] transition">
              <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-semibold">
                {c.otherName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className={c.unreadCount > 0 ? "font-bold" : "font-semibold"}>{c.otherName}</p>
                  <p className="text-[#6B7280] text-xs">{c.listingTitle}</p>
                </div>
                <p className={c.unreadCount > 0 ? "text-[#14161F] text-sm truncate font-medium" : "text-[#6B7280] text-sm truncate"}>
                  {c.lastMessage}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-[#4F46E5] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] py-4 flex justify-around text-[#6B7280]">
        <Link href="/feed">
          <span className="cursor-pointer flex flex-col items-center gap-1">
            <Home size={22} />
            <span className="text-xs">Home</span>
          </span>
        </Link>

        <Link href="/stay">
          <span className="cursor-pointer flex flex-col items-center gap-1">
            <Building2 size={22} />
            <span className="text-xs">Stay</span>
          </span>
        </Link>

        <span className="cursor-pointer flex flex-col items-center gap-1">
          <User size={22} />
          <span className="text-xs">Profile</span>
        </span>
      </div>

    </main>
  );
}