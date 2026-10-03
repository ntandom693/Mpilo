"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type LikeButtonProps = {
  postId: number;
};

export default function LikeButton({ postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    async function loadLikes() {
      const { data: allLikes } = await supabase
        .from("likes")
        .select("user_id")
        .eq("post_id", postId);

      if (allLikes) {
        setCount(allLikes.length);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const alreadyLiked = allLikes?.some(
          (like) => like.user_id === sessionData.session.user.id
        );
        setLiked(!!alreadyLiked);
      }
    }

    loadLikes();
  }, [postId]);

  async function handleLike() {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      window.location.href = "/signup";
      return;
    }

    const userId = sessionData.session.user.id;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      setLiked(false);
      setCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });

      setLiked(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }
  }

  return (
    <button onClick={handleLike} className="flex items-center gap-1.5">
      <Heart
        size={22}
        className={`transition-transform duration-200 ${
          animating ? "scale-125" : "scale-100"
        }`}
        fill={liked ? "#EF4444" : "none"}
        color={liked ? "#EF4444" : "#6B7280"}
      />
      <span className="text-[#6B7280] text-sm">{count}</span>
    </button>
  );
}