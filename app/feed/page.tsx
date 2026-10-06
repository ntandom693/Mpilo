"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactionButton from "@/components/ReactionButton";
import { supabase } from "@/lib/supabase";
import {
  Home,
  Building2,
  User,
  MessageCircle,
  Trash2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
} from "lucide-react";

// WhatsApp number that receives reports (South Africa, no + or leading 0)
const REPORT_WHATSAPP = "27697858221";

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam or scam",
  "Harassment or bullying",
  "Fake or misleading",
  "Something else",
];

type Post = {
  id: number;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
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

type StayPreview = {
  id: number;
  title: string;
  image_url: string | null;
  area: string | null;
  location: string | null;
  price: string | null;
  is_residence: boolean;
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

// Swipeable photos with dots (a single photo just shows normally)
function ImageGallery({ images, href }: { images: string[]; href: string }) {
  const [index, setIndex] = useState(0);
  const multiple = images.length > 1;

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#111318]">
      <div
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((src, i) => (
          <Link
            key={`${src}-${i}`}
            href={href}
            className="w-full flex-shrink-0 snap-center"
          >
            <img
              src={src}
              alt={`Post image ${i + 1}`}
              className={`w-full object-cover ${
                multiple ? "aspect-[4/5]" : "max-h-[680px]"
              }`}
            />
          </Link>
        ))}
      </div>

      {multiple && (
        <>
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {index + 1}/{images.length}
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Feed() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [stays, setStays] = useState<StayPreview[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [myInitial, setMyInitial] = useState("D");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [reportingPost, setReportingPost] = useState<Post | null>(null);

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id || null;
      setMyId(uid);

      // Load posts, people and stays at the same time
      const [postsRes, peopleRes, staysRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("user_id, first_name, last_name, avatar_url")
          .limit(12),
        supabase
          .from("listings")
          .select("id, title, image_url, area, location, price, is_residence")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (peopleRes.data) {
        setPeople(
          peopleRes.data.filter((p) => p.user_id !== uid).slice(0, 10)
        );
      }

      if (staysRes.data) {
        setStays(staysRes.data);
      }

      // Get every post author in ONE request (much faster)
      const rawPosts = postsRes.data || [];

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

      setPosts(
        rawPosts.map((post) => {
          const author = post.user_id ? authorMap.get(post.user_id) : null;

          return {
            ...post,
            authorName: author?.name || "Someone",
            authorAvatar: author?.avatar || null,
          };
        })
      );

      setLoading(false);

      // Things that only matter when logged in
      if (uid) {
        const [meRes, followsRes, savedRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("first_name, avatar_url")
            .eq("user_id", uid)
            .maybeSingle(),
          supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", uid),
          supabase.from("saved_posts").select("post_id").eq("user_id", uid),
        ]);

        if (meRes.data) {
          setMyAvatar(meRes.data.avatar_url);
          if (meRes.data.first_name) {
            setMyInitial(meRes.data.first_name.charAt(0).toUpperCase());
          }
        }

        if (followsRes.data) {
          setFollowingIds(new Set(followsRes.data.map((f) => f.following_id)));
        }

        if (savedRes.data) {
          setSavedIds(new Set(savedRes.data.map((s) => s.post_id)));
        }
      }
    }

    init();
  }, []);

  // Not logged in: sign up / log in, then come back to the feed
  function needLogin() {
    router.push(`/signup?returnTo=${encodeURIComponent("/feed")}`);
  }

  async function handleDeletePost(postId: number) {
    const confirmed = window.confirm(
      "Delete this post? This can't be undone."
    );

    if (!confirmed) return;

    await supabase.from("comments").delete().eq("post_id", postId);
    await supabase.from("likes").delete().eq("post_id", postId);
    await supabase.from("saved_posts").delete().eq("post_id", postId);
    await supabase.from("posts").delete().eq("id", postId);

    setPosts(posts.filter((p) => p.id !== postId));
  }

  async function toggleSave(postId: number) {
    if (!myId) {
      needLogin();
      return;
    }

    if (savedIds.has(postId)) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", myId)
        .eq("post_id", postId);

      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      await supabase
        .from("saved_posts")
        .insert({ user_id: myId, post_id: postId });

      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
    }
  }

  async function toggleFollow(personId: string) {
    if (!myId) {
      needLogin();
      return;
    }

    if (followingIds.has(personId)) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", myId)
        .eq("following_id", personId);

      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: myId, following_id: personId });

      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.add(personId);
        return next;
      });
    }
  }

  // Opens WhatsApp with a ready-made report message
  function sendReport(reason: string) {
    if (!reportingPost) return;

    const snippet =
      reportingPost.content.length > 100
        ? reportingPost.content.slice(0, 100) + "..."
        : reportingPost.content;

    const message =
      `Report from Denverr\n` +
      `Reason: ${reason}\n` +
      `Posted by: ${reportingPost.authorName}\n` +
      `Post ID: ${reportingPost.id}\n` +
      `Post: "${snippet}"\n` +
      `Link: ${window.location.origin}/comments/${reportingPost.id}`;

    const url = `https://wa.me/${REPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
    setReportingPost(null);
  }

  // Share something: if not logged in, sign up / log in,
  // then come straight back to the compose page.
  async function handleCompose() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/compose");
    } else {
      router.push(`/signup?returnTo=${encodeURIComponent("/compose")}`);
    }
  }

  // View a place to stay: if not logged in, sign up / log in,
  // then come straight back to that place.
  async function handleViewStay(listingId: number) {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push(`/stay/room/${listingId}`);
    } else {
      router.push(
        `/signup?returnTo=${encodeURIComponent(`/stay/room/${listingId}`)}`
      );
    }
  }

  // The /profile page decides: logged in -> your profile,
  // not logged in -> login, then your profile.
  function goToMyProfile() {
    router.push("/profile");
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

          <Link href="/saved" aria-label="Saved posts">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8EAF0] flex items-center justify-center shadow-sm cursor-pointer active:scale-90 transition-transform">
              <Bookmark size={18} strokeWidth={1.8} />
            </div>
          </Link>
        </div>

        <p className="text-[#737983] mt-5 text-[15px]">
          What’s happening?
        </p>
      </header>

      {/* Create post */}
      <section className="px-6">
        <button
          type="button"
          onClick={handleCompose}
          className="w-full text-left bg-white rounded-[20px] px-4 py-3.5 border border-[#E8EAF0] flex items-center gap-3 active:scale-[0.99] transition"
        >
          {myAvatar ? (
            <img
              src={myAvatar}
              alt="You"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#111318] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {myInitial}
            </div>
          )}

          <span className="flex-1 text-[#737983] text-[15px]">
            Share something.
          </span>

          <div className="w-9 h-9 rounded-full bg-[#F1F3F5] text-[#111318] flex items-center justify-center flex-shrink-0">
            <ImageIcon size={18} strokeWidth={1.8} />
          </div>
        </button>
      </section>

      {/* People */}
      <section className="mt-8">
        <div className="px-6 flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold">
            People on Denverr
          </h2>
        </div>

        {people.length === 0 ? (
          <p className="px-6 text-[#8A8F98] text-sm">
            No one else here yet — invite your friends!
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {people.map((person) => {
              const isFollowing = followingIds.has(person.user_id);

              return (
                <div
                  key={person.user_id}
                  className="flex-shrink-0 w-[96px] bg-white border border-[#E8EAF0] rounded-[20px] px-3 py-4 text-center"
                >
                  <Link href={`/profile/${person.user_id}`}>
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.first_name}
                        className="w-[54px] h-[54px] rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-[54px] h-[54px] rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold mx-auto">
                        {person.first_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <p className="text-[12px] font-semibold mt-2 truncate">
                      {person.first_name}
                    </p>
                  </Link>

                  <button
                    onClick={() => toggleFollow(person.user_id)}
                    className={`mt-3 w-full rounded-full py-1.5 text-[11px] font-semibold active:scale-95 transition ${
                      isFollowing
                        ? "bg-white border border-[#DDE0E5] text-[#111318]"
                        : "bg-[#111318] text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* New places to stay */}
      {stays.length > 0 && (
        <section className="mt-8">
          <div className="px-6 flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold">
              New places to stay
            </h2>

            <Link
              href="/stay"
              className="text-[12px] font-semibold text-[#8A8F98]"
            >
              See all
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {stays.map((stay) => (
              <button
                key={stay.id}
                onClick={() => handleViewStay(stay.id)}
                className="flex-shrink-0 w-[210px] text-left bg-white border border-[#E8EAF0] rounded-[20px] overflow-hidden active:scale-[0.98] transition"
              >
                {stay.image_url ? (
                  <img
                    src={stay.image_url}
                    alt={stay.title}
                    className="w-full h-[120px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[120px] bg-[#E9EBEE] flex items-center justify-center">
                    <Building2
                      size={26}
                      strokeWidth={1.4}
                      className="text-[#A3A7AE]"
                    />
                  </div>
                )}

                <div className="px-3.5 py-3">
                  <p className="text-[13px] font-semibold truncate">
                    {stay.title}
                  </p>

                  <p className="text-[11px] text-[#8A8F98] mt-0.5 truncate">
                    {stay.area || stay.location || "Near campus"}
                  </p>

                  <p className="text-[12px] font-semibold mt-1.5">
                    {stay.is_residence ? "Residence" : stay.price || ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

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

        {posts.map((post) => {
          const images =
            post.image_urls && post.image_urls.length > 0
              ? post.image_urls
              : post.image_url
              ? [post.image_url]
              : [];

          const isSaved = savedIds.has(post.id);

          return (
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
                  {post.user_id === myId ? (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8F98] hover:bg-[#ECEEF2] hover:text-red-500 transition"
                      aria-label="Delete post"
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setReportingPost(post)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8F98] hover:bg-[#ECEEF2] transition"
                      aria-label="Report post"
                    >
                      <MoreHorizontal size={19} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </div>

              {/* PHOTOS */}
              {images.length > 0 && (
                <div className="mt-4 px-3">
                  <ImageGallery
                    images={images}
                    href={`/comments/${post.id}`}
                  />
                </div>
              )}

              {/* Caption + actions */}
              <div className="px-6 mt-4">

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

                  <button
                    onClick={() => toggleSave(post.id)}
                    className="ml-auto flex items-center justify-center text-[#555B65] hover:text-[#111318] active:scale-90 transition"
                    aria-label={isSaved ? "Unsave post" : "Save post"}
                  >
                    <Bookmark
                      size={22}
                      strokeWidth={1.8}
                      fill={isSaved ? "#111318" : "none"}
                      color={isSaved ? "#111318" : "currentColor"}
                    />
                  </button>

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
          );
        })}

      </section>

      {/* REPORT SHEET */}
      {reportingPost && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setReportingPost(null)}
          />

          <div className="relative w-full bg-white rounded-t-[26px] px-6 pt-5 pb-8">
            <div className="w-10 h-1 bg-[#E2E5E9] rounded-full mx-auto mb-5" />

            <h3 className="text-[18px] font-bold tracking-[-0.02em]">
              Report this post
            </h3>

            <p className="text-[13px] text-[#8A8F98] mt-1">
              Why are you reporting it? This opens WhatsApp so you can send
              the report to us.
            </p>

            <div className="mt-5 space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => sendReport(reason)}
                  className="w-full text-left bg-[#F7F8FA] border border-[#E7E9ED] rounded-[14px] px-4 py-3.5 text-[14px] font-medium active:scale-[0.99] transition"
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={() => setReportingPost(null)}
              className="w-full mt-4 py-3 text-[14px] font-semibold text-[#6F727B]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
