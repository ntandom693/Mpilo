"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const REACTIONS = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😡" },
];

type ReactionButtonProps = {
  postId: number;
};

export default function ReactionButton({ postId }: ReactionButtonProps) {
  const router = useRouter();

  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadReactions() {
      const { data: allReactions } = await supabase
        .from("likes")
        .select("user_id, type")
        .eq("post_id", postId);

      if (allReactions) {
        setCount(allReactions.length);
      }

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const myUserId = sessionData.session.user.id;

        const mine = allReactions?.find((r) => r.user_id === myUserId);
        setMyReaction(mine ? mine.type : null);
      }
    }

    loadReactions();
  }, [postId]);

  async function setReaction(type: string) {
    const { data: sessionData } = await supabase.auth.getSession();

    // Not logged in: sign up / log in, then come back to this same page
    if (!sessionData.session) {
      const here = window.location.pathname + window.location.search;
      router.push(`/signup?returnTo=${encodeURIComponent(here)}`);
      return;
    }

    const userId = sessionData.session.user.id;

    if (myReaction === type) {
      // Tapping the same reaction again removes it
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      setMyReaction(null);
      setCount((c) => c - 1);
    } else if (myReaction) {
      // Switching to a different reaction
      await supabase
        .from("likes")
        .update({ type })
        .eq("post_id", postId)
        .eq("user_id", userId);

      setMyReaction(type);
    } else {
      // First reaction
      await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: userId, type });

      setMyReaction(type);
      setCount((c) => c + 1);
    }

    setShowPicker(false);
  }

  function handlePressStart() {
    pressTimer.current = setTimeout(() => {
      setShowPicker(true);
    }, 400);
  }

  function handlePressEnd() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  }

  function handleTap() {
    if (showPicker) return;
    setReaction(myReaction ? myReaction : "like");
  }

  const currentEmoji = REACTIONS.find((r) => r.type === myReaction)?.emoji;

  return (
    <div className="relative">
      {showPicker && (
        <div className="absolute bottom-10 left-0 bg-white border border-[#E5E7EB] rounded-full shadow-lg px-3 py-2 flex gap-2 z-10">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => setReaction(r.type)}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleTap}
        className="flex items-center gap-1.5"
      >
        <span className="text-lg">{currentEmoji || "👍"}</span>
        <span className="text-[#6B7280] text-sm">{count}</span>
      </button>
    </div>
  );
}
