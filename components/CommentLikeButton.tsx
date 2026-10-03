"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CommentLikeButtonProps = {
  commentId: number;
};

export default function CommentLikeButton({ commentId }: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadLikes() {
      const { data: allLikes } = await supabase
        .from("comment_likes")
        .select("user_id")
        .eq("comment_id", commentId);

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
  }, [commentId]);

  async function handleLike() {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      window.location.href = "/signup";
      return;
    }

    const userId = sessionData.session.user.id;

    if (liked) {
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);

      setLiked(false);
      setCount((c) => c - 1);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId });

      setLiked(true);
      setCount((c) => c + 1);
    }
  }

  return (
    <button onClick={handleLike} className="flex items-center gap-1 text-xs">
      <Heart
        size={14}
        fill={liked ? "#EF4444" : "none"}
        color={liked ? "#EF4444" : "#6B7280"}
      />
      {count > 0 && <span className="text-[#6B7280]">{count}</span>}
    </button>
  );
}