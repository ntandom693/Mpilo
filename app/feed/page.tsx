"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactionButton from "@/components/ReactionButton";
import { supabase } from "@/lib/supabase";
import {
  Home,
  Building2,
  User,
  MessageCircle,
  Trash2,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

type Post = {
  id: number;
  content: string;
  image_url: string | null;
  user_id: string | null;
  created_at: string;
  authorName: string;
  authorAvatar: string | null;
};

type Person = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

function timeAgo(dateString: string) {
  const now = new Date();
  const posted = new Date(dateString);
  const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return posted.toLocaleDateString();
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPeople() {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .limit(6);

      if (data) {
        setPeople(data);
      }
    }

    loadPeople();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      const { data: sessionData } = await supabase.auth.getSession();
      setMyId(sessionData.session?.user.id || null);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const postsWithNames = await Promise.all(
          data.map(async (post) => {
            let authorName = "Someone";
            let authorAvatar = null;

            if (post.user_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("first_name, last_name, avatar_url")
                .eq("user_id", post.user_id)
                .single();

              if (profile) {
                authorName = `${profile.first_name} ${profile.last_name.charAt(0)}.`;
                authorAvatar = profile.avatar_url;
              }
            }

            return {
              ...post,
              authorName,
              authorAvatar,
            };
          })
        );

        setPosts(postsWithNames);
      }

      setLoading(false);
    }

    loadPosts();
  }, []);

  async function handleDeletePost(postId: number) {
    const confirmed = window.confirm(
      "Delete this post? This can't be undone."
    );

    if (!confirmed) return;

    await supabase.from("comments").delete().eq("post_id", postId);
    await supabase.from("likes").delete().eq("post_id", postId);
    await supabase.from("posts").delete().eq("id", postId);

    setPosts(posts.filter((p) => p.id !== postId));
  }

  async function goToMyProfile() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      window.location.href = `/profile/${data.session.user.id}`;
    } else {
      window.location.href = "/signup";
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-28">

      {/* Header */}
      <header className="px-6 pt-8 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#8A8F98] tracking-wide">
              YOUR CAMPUS
            </p>

            <h1 className="text-[30px] leading-none font-bold tracking-[-0.04em] mt-1">
              Denverr
            </h1>
          </div>

          <Link href="/feedback">
  <div className="w-10 h-10 rounded-full bg-white border border-[#E8EAF0] flex items-center justify-center shadow-sm cursor-pointer active:scale-90 transition-transform">
    <Sparkles size={18} strokeWidth={1.8} />
  </div>
</Link>
        </div>

        <p className="text-[#737983] mt-5 text-[15px]">
          What’s happening?
        </p>
      </header>

      {/* People */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold">
            People on Denverr
          </h2>
        </div>

        {people.length === 0 ? (
          <p className="text-[#8A8F98] text-sm">
            No one else here yet — invite your friends!
          </p>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {people.map((person) => (
              <Link
                href={`/profile/${person.user_id}`}
                key={person.user_id}
                className="flex-shrink-0"
              >
                <div className="text-center">
                  {person.avatar_url ? (
                    <img
                      src={person.avatar_url}
                      alt={person.first_name}
                      className="w-[54px] h-[54px] rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-[54px] h-[54px] rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold">
                      {person.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <p className="text-[12px] font-medium mt-2 max-w-[60px] truncate">
                    {person.first_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Create post */}
      <section className="px-6 mt-7">
        <Link href="/compose">
          <div className="bg-white rounded-[20px] px-5 py-4 border border-[#E8EAF0] flex items-center justify-between active:scale-[0.99] transition">
            <span className="text-[#737983] text-[15px]">
              Share something.
            </span>

            <div className="w-9 h-9 rounded-full bg-[#111318] text-white flex items-center justify-center">
              <span className="text-[20px] leading-none">+</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Loading */}
      {loading && (
        <div className="px-6 mt-10 text-center">
          <p className="text-[#8A8F98] text-sm">
            Loading posts...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="px-6 mt-10 text-center">
          <div className="max-w-sm mx-auto">
            <p className="text-[16px] font-semibold">
              Nothing here yet.
            </p>

            <p className="text-[#8A8F98] text-sm mt-1">
              Be the first person to share something.
            </p>
          </div>
        </div>
      )}

      {/* Feed */}
      <section className="mt-8">

        {posts.map((post) => (

          <article
            key={post.id}
            className="mb-12"
          >

            {/* Identity row */}
            <div className="px-6 flex items-center">
              <Link
                href={`/profile/${post.user_id}`}
                className="flex items-center gap-3 min-w-0"
              >
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold">
                    {post.authorName.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-[14px] truncate">
                    {post.authorName}
                  </p>

                  <p className="text-[#969BA4] text-[12px] mt-[1px]">
                    {timeAgo(post.created_at)}
                  </p>
                </div>
              </Link>

              <div className="ml-auto flex items-center gap-2">
                {post.user_id === myId && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8F98] hover:bg-[#ECEEF2] hover:text-red-500 transition"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                )}

                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8F98] hover:bg-[#ECEEF2] transition"
                >
                  <MoreHorizontal size={19} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* IMAGE POST */}
            {post.image_url && (
              <div className="mt-4 px-3">
                <Link href={`/comments/${post.id}`}>
                  <div className="relative overflow-hidden rounded-[24px] bg-[#111318]">

                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full max-h-[680px] object-cover transition-transform duration-500 hover:scale-[1.015]"
                    />

                  </div>
                </Link>
              </div>
            )}

            {/* Caption + actions */}
            <div className={post.image_url ? "px-6 mt-4" : "px-6 mt-4"}>

              {/* Actions */}
              <div className="flex items-center gap-5 mb-3">

                <ReactionButton postId={post.id} />

                <Link href={`/comments/${post.id}`}>
                  <button
                    className="flex items-center justify-center text-[#555B65] hover:text-[#111318] transition"
                    aria-label="Comments"
                  >
                    <MessageCircle
                      size={22}
                      strokeWidth={1.8}
                    />
                  </button>
                </Link>

              </div>

              {/* Caption */}
              <div className="text-[15px] leading-[1.5]">
                <span className="font-semibold mr-1.5">
                  {post.authorName}
                </span>

                <span className="text-[#252932]">
                  {post.content}
                </span>
              </div>

            </div>

          </article>

        ))}

      </section>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E8EAF0] px-8 py-3">

        <div className="max-w-md mx-auto flex items-center justify-between">

          <Link href="/feed">
            <div className="flex flex-col items-center gap-1 text-[#111318]">
              <Home
                size={22}
                strokeWidth={2}
              />
              <span className="text-[10px] font-medium">
                Home
              </span>
            </div>
          </Link>

          <Link href="/stay">
            <div className="flex flex-col items-center gap-1 text-[#8A8F98]">
              <Building2
                size={22}
                strokeWidth={1.8}
              />
              <span className="text-[10px] font-medium">
                Stay
              </span>
            </div>
          </Link>

          <button
            onClick={goToMyProfile}
            className="flex flex-col items-center gap-1 text-[#8A8F98]"
          >
            <User
              size={22}
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium">
              Profile
            </span>
          </button>

        </div>

      </nav>

    </main>
  );
}