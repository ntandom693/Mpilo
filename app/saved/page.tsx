"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bookmark, Home, Building2, User } from "lucide-react";

type SavedPost = {
  id: number;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  user_id: string | null;
  authorName: string;
  authorAvatar: string | null;
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

export default function SavedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;

      // Not logged in: sign up / log in, then come back to Saved
      if (!uid) {
        router.replace(`/signup?returnTo=${encodeURIComponent("/saved")}`);
        return;
      }

      setMyId(uid);

      // Newest saved first
      const { data: savedRows } = await supabase
        .from("saved_posts")
        .select("post_id, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      const ids = (savedRows || []).map((row) => row.post_id);

      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      const { data: postRows } = await supabase
        .from("posts")
        .select("*")
        .in("id", ids);

      const rawPosts = postRows || [];

      // Get every author in one request
      const authorIds = Array.from(
        new Set(rawPosts.map((p) => p.user_id).filter(Boolean))
      ) as string[];

      const authorMap = new Map<
        string,
        { name: string; avatar: string | null }
      >();

      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, avatar_url")
          .in("user_id", authorIds);

        authors?.forEach((a) => {
          authorMap.set(a.user_id, {
            name: `${a.first_name} ${a.last_name?.charAt(0) || ""}.`,
            avatar: a.avatar_url,
          });
        });
      }

      const postMap = new Map<number, SavedPost>();

      rawPosts.forEach((post) => {
        const author = post.user_id ? authorMap.get(post.user_id) : null;

        postMap.set(post.id, {
          ...post,
          authorName: author?.name || "Someone",
          authorAvatar: author?.avatar || null,
        });
      });

      // Keep the order they were saved in (skips posts that were deleted)
      const ordered = ids
        .map((id) => postMap.get(id))
        .filter(Boolean) as SavedPost[];

      setPosts(ordered);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleUnsave(postId: number) {
    if (!myId) return;

    await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", myId)
      .eq("post_id", postId);

    setPosts(posts.filter((p) => p.id !== postId));
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-28">

      {/* TOP BAR */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <Link href="/feed">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E7E9ED] flex items-center justify-center active:scale-90 transition">
            <ArrowLeft size={19} strokeWidth={1.9} />
          </div>
        </Link>

        <p className="text-[12px] font-semibold tracking-[0.12em] text-[#9297A1]">
          SAVED
        </p>

        <div className="w-10 h-10" />
      </header>

      {/* TITLE */}
      <section className="px-6 mt-8">
        <h1 className="text-[30px] leading-none font-bold tracking-[-0.04em]">
          Saved.
        </h1>

        <p className="text-[#737983] mt-3 text-[15px]">
          Posts you want to come back to.
        </p>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="px-6 mt-8 space-y-3">
          <div className="h-24 bg-white border border-[#E7E9ED] rounded-[20px] animate-pulse" />
          <div className="h-24 bg-white border border-[#E7E9ED] rounded-[20px] animate-pulse" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && posts.length === 0 && (
        <section className="px-6 mt-8">
          <div className="bg-white border border-[#E7E9ED] rounded-[24px] px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F1F3F5] mx-auto flex items-center justify-center">
              <Bookmark size={23} strokeWidth={1.7} />
            </div>

            <h3 className="font-semibold text-[16px] mt-5">
              Nothing saved yet.
            </h3>

            <p className="text-[#8A8F98] text-[13px] leading-5 mt-2 max-w-[260px] mx-auto">
              Tap the bookmark on any post and it will be waiting for you here.
            </p>

            <Link href="/feed">
              <button className="mt-6 bg-[#111318] text-white px-5 py-3 rounded-[15px] text-[13px] font-semibold active:scale-[0.98] transition">
                Back to the feed
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* SAVED POSTS */}
      {!loading && posts.length > 0 && (
        <section className="px-6 mt-8 space-y-3">
          {posts.map((post) => {
            const images =
              post.image_urls && post.image_urls.length > 0
                ? post.image_urls
                : post.image_url
                ? [post.image_url]
                : [];

            return (
              <div
                key={post.id}
                className="bg-white border border-[#E7E9ED] rounded-[22px] p-3 flex gap-3 items-center"
              >
                <Link
                  href={`/comments/${post.id}`}
                  className="flex-1 min-w-0 flex gap-3 items-center"
                >
                  {/* THUMBNAIL */}
                  {images.length > 0 ? (
                    <div className="relative w-[84px] h-[84px] rounded-[16px] overflow-hidden bg-[#111318] flex-shrink-0">
                      <img
                        src={images[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />

                      {images.length > 1 && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                          +{images.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-[84px] h-[84px] rounded-[16px] bg-[#F1F3F5] flex items-center justify-center flex-shrink-0">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold text-sm">
                          {post.authorName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEXT */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate">
                      {post.authorName}
                      <span className="text-[#969BA4] font-normal ml-1.5">
                        {timeAgo(post.created_at)}
                      </span>
                    </p>

                    <p className="text-[14px] text-[#333842] mt-1 leading-snug line-clamp-3">
                      {post.content || "Photo post"}
                    </p>
                  </div>
                </Link>

                {/* UNSAVE */}
                <button
                  onClick={() => handleUnsave(post.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#111318] hover:bg-[#ECEEF2] active:scale-90 transition flex-shrink-0"
                  aria-label="Remove from saved"
                >
                  <Bookmark size={20} strokeWidth={1.8} fill="#111318" />
                </button>
              </div>
            );
          })}
        </section>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E7E9ED] px-8 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">

          <Link href="/feed">
            <div className="flex flex-col items-center gap-1 text-[#8A8F98]">
              <Home size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Home</span>
            </div>
          </Link>

          <Link href="/stay">
            <div className="flex flex-col items-center gap-1 text-[#8A8F98]">
              <Building2 size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">Stay</span>
            </div>
          </Link>

          <button
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center gap-1 text-[#8A8F98]"
          >
            <User size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>

        </div>
      </nav>

    </main>
  );
}
