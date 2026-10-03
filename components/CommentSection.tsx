"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: number;
  content: string;
  authorName: string;
};

type CommentSectionProps = {
  postId: number;
};

export default function CommentSection({ postId }: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function loadCount() {
      const { data } = await supabase
        .from("comments")
        .select("id")
        .eq("post_id", postId);

      if (data) setCount(data.length);
    }

    loadCount();
  }, [postId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      const withNames = await Promise.all(
        data.map(async (comment) => {
          let authorName = "Someone";

          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", comment.user_id)
            .single();

          if (profile) {
            authorName = `${profile.first_name} ${profile.last_name.charAt(0)}.`;
          }

          return { ...comment, authorName };
        })
      );

      setComments(withNames);
    }
  }
  
  async function handleToggle() {
    if (!open) {
      await loadComments();
    }
    setOpen(!open);
  }

  async function handlePostComment() {
    setPosting(true);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      window.location.href = "/signup";
      return;
    }

    await supabase.from("comments").insert({
      post_id: postId,
      user_id: sessionData.session.user.id,
      content: text,
    });

    setText("");
    setPosting(false);
    setCount((c) => c + 1);
    loadComments();
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[#6B7280]"
      >
        <MessageCircle size={22} />
        <span className="text-sm">{count}</span>
      </button>

      {open && (
        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-2">
              <span className="font-semibold text-sm">{comment.authorName}</span>{" "}
              <span className="text-sm text-[#14161F]">{comment.content}</span>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#F6F7F9] border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4F46E5]"
            />
            <button
              onClick={handlePostComment}
              disabled={text.trim() === "" || posting}
              className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}