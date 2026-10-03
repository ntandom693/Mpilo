"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  sender_id: string;
  content: string;
};

export default function Chat() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");
  const otherIdParam = searchParams.get("otherId");

  const [otherName, setOtherName] = useState("this person");
  const [otherId, setOtherId] = useState<string | null>(null);
  const [listingTitle, setListingTitle] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setup() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        window.location.href = "/signup";
        return;
      }

      const myUserId = sessionData.session.user.id;
      setMyId(myUserId);

      if (listingId) {
        const { data: listing } = await supabase
          .from("listings")
          .select("title, user_id")
          .eq("id", listingId)
          .single();

        if (listing) {
          setListingTitle(listing.title);

          const targetId = otherIdParam || listing.user_id;
          setOtherId(targetId);

          if (targetId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("user_id", targetId)
              .single();

            if (profile) {
              setOtherName(`${profile.first_name} ${profile.last_name.charAt(0)}.`);
            }
          }

          const { data: existingMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("listing_id", listingId)
            .or(
              `and(sender_id.eq.${myUserId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${myUserId})`
            )
            .order("created_at", { ascending: true });

          if (existingMessages) {
            setMessages(existingMessages);
          }

          if ((!existingMessages || existingMessages.length === 0) && !otherIdParam) {
            setText(
              `Hi, I'm interested in your room listing "${listing.title}". Is it still available?`
            );
          }

          // Mark any messages sent TO me on this listing as read
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("listing_id", listingId)
            .eq("receiver_id", myUserId);
        }
      }

      setLoading(false);
    }

    setup();
  }, [listingId, otherIdParam]);

  async function handleSend() {
    if (text.trim() === "" || !myId || !otherId || !listingId) return;

    const { error } = await supabase.from("messages").insert({
      listing_id: Number(listingId),
      sender_id: myId,
      receiver_id: otherId,
      content: text,
    });

    if (!error) {
      setMessages([...messages, { id: Date.now(), sender_id: myId, content: text }]);
      setText("");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <p className="text-[#6B7280]">Loading chat...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-3">
        <Link href="/messages">
          <span className="text-[#6B7280] cursor-pointer">←</span>
        </Link>

        <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-semibold">
          {otherName.charAt(0)}
        </div>

        <div>
          <p className="font-semibold">{otherName}</p>
          <p className="text-[#6B7280] text-xs">{listingTitle}</p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 px-6 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-[#6B7280] text-sm text-center mt-8">
            Start the conversation — your message is ready below.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender_id === myId
                ? "self-end bg-[#4F46E5] text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs"
                : "self-start bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs"
            }
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-[#E5E7EB] px-4 py-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-[#F6F7F9] border border-[#E5E7EB] rounded-xl px-4 py-2 focus:outline-none focus:border-[#4F46E5]"
        />

        <button
          onClick={handleSend}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#4338CA] transition"
        >
          Send
        </button>
      </div>

    </main>
  );
}