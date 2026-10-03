"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Home,
  Building2,
  User,
  MessageCircle,
  Trash2,
  Camera,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import ReactionButton from "@/components/ReactionButton";

type Post = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
};

function timeAgo(dateString: string) {
  const now = new Date();
  const posted = new Date(dateString);
  const seconds = Math.floor(
    (now.getTime() - posted.getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d`;

  return posted.toLocaleDateString();
}

export default function Profile() {
  const params = useParams();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const [myId, setMyId] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const idOrUsername = params.username as string;

      const { data: sessionData } =
        await supabase.auth.getSession();

      const currentUserId =
        sessionData.session?.user.id || null;

      setMyId(currentUserId);

      if (currentUserId === idOrUsername) {
        setIsOwnProfile(true);
      }

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("user_id", idOrUsername)
        .single();

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAvatarUrl(data.avatar_url);
      }

      const { data: followers } = await supabase
        .from("follows")
        .select("id")
        .eq("following_id", idOrUsername);

      setFollowerCount(followers?.length || 0);

      const { data: following } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", idOrUsername);

      setFollowingCount(following?.length || 0);

      if (
        currentUserId &&
        currentUserId !== idOrUsername
      ) {
        const { data: existingFollow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", idOrUsername)
          .single();

        setIsFollowing(!!existingFollow);
      }

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", idOrUsername)
        .order("created_at", { ascending: false });

      if (userPosts) {
        setPosts(userPosts);
      }

      setPostsLoading(false);
      setLoading(false);
    }

    loadProfile();
  }, [params.username]);

  async function handleFollowToggle() {
    if (!myId) {
      window.location.href = "/signup";
      return;
    }

    const idOrUsername = params.username as string;

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", myId)
        .eq("following_id", idOrUsername);

      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from("follows").insert({
        follower_id: myId,
        following_id: idOrUsername,
      });

      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  }

  async function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Photo upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const idOrUsername = params.username as string;

    await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrlData.publicUrl,
      })
      .eq("user_id", idOrUsername);

    setAvatarUrl(publicUrlData.publicUrl);
    setUploading(false);
  }

  async function handleDeletePost(postId: number) {
    const confirmed = window.confirm(
      "Delete this post? This can't be undone."
    );

    if (!confirmed) return;

    await supabase
      .from("comments")
      .delete()
      .eq("post_id", postId);

    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId);

    await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    setPosts(posts.filter((p) => p.id !== postId));
  }

  async function goToMyProfile() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      window.location.href =
        `/profile/${data.session.user.id}`;
    } else {
      window.location.href = "/signup";
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const displayName = firstName
    ? `${firstName} ${lastName.charAt(0)}${
        lastName ? "." : ""
      }`
    : loading
    ? "Loading..."
    : "Student";

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-28">

      {/* TOP BAR */}
      <header className="px-5 pt-6 flex items-center justify-between">

        <Link href="/feed">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E7E9ED] flex items-center justify-center active:scale-90 transition">
            <ArrowLeft
              size={19}
              strokeWidth={1.9}
            />
          </div>
        </Link>

        <p className="text-[12px] font-semibold tracking-[0.12em] text-[#9297A1]">
          PROFILE
        </p>

        {isOwnProfile ? (
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white border border-[#E7E9ED] flex items-center justify-center text-[#777D86] active:scale-90 transition"
            aria-label="Log out"
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
            />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

      </header>

      {/* PROFILE HERO */}
      <section className="px-6 mt-10">

        <div className="flex items-center gap-5">

          {/* AVATAR */}
          <div className="relative flex-shrink-0">

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-[92px] h-[92px] rounded-full object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-[92px] h-[92px] rounded-full bg-[#111318] text-white flex items-center justify-center text-[30px] font-semibold border-4 border-white shadow-sm">
                {firstName.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            {isOwnProfile && (
              <label
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border border-[#E2E5E9] shadow-sm flex items-center justify-center cursor-pointer active:scale-90 transition"
              >
                <Camera
                  size={16}
                  strokeWidth={1.9}
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}

          </div>

          {/* NAME */}
          <div className="min-w-0">

            <p className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[#969BA4]">
              Student
            </p>

            <h1 className="text-[26px] leading-tight font-bold tracking-[-0.04em] mt-1">
              {displayName}
            </h1>

            {uploading && (
              <p className="text-[11px] text-[#9297A1] mt-1">
                Updating photo...
              </p>
            )}

          </div>

        </div>

        {/* FOLLOW */}
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            className={`w-full mt-6 rounded-[16px] py-3.5 text-[14px] font-semibold active:scale-[0.985] transition ${
              isFollowing
                ? "bg-white border border-[#DDE0E5] text-[#111318]"
                : "bg-[#111318] text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}

      </section>

      {/* STATS */}
<section className="px-6 mt-8">

<div className="bg-white border border-[#E7E9ED] rounded-[22px] px-5 py-5">

  <div className="grid grid-cols-3">

    <div className="text-center">
      <p className="text-[20px] font-bold tracking-[-0.03em]">
        {posts.length}
      </p>

      <p className="text-[11px] text-[#8A8F98] mt-1">
        Posts
      </p>
    </div>

    <Link
      href={`/profile/${params.username}/followers`}
      className="text-center border-x border-[#ECEEF1] active:scale-[0.97] transition"
    >
      <p className="text-[20px] font-bold tracking-[-0.03em]">
        {followerCount}
      </p>

      <p className="text-[11px] text-[#8A8F98] mt-1">
        Followers
      </p>
    </Link>

    <Link
      href={`/profile/${params.username}/following`}
      className="text-center active:scale-[0.97] transition"
    >
      <p className="text-[20px] font-bold tracking-[-0.03em]">
        {followingCount}
      </p>

      <p className="text-[11px] text-[#8A8F98] mt-1">
        Following
      </p>
    </Link>

  </div>

</div>

</section>

      {/* POSTS */}
      <section className="mt-5">

        {postsLoading && (
          <div className="px-6">
            <div className="h-24 bg-white border border-[#E7E9ED] rounded-[20px] animate-pulse" />
          </div>
        )}

        {!postsLoading && posts.length === 0 && (
          <div className="px-6">

            <div className="bg-white border border-[#E7E9ED] rounded-[22px] px-6 py-10 text-center">

              <p className="text-[15px] font-semibold">
                Nothing shared yet.
              </p>

              <p className="text-[12px] text-[#9297A1] mt-2">
                Posts will appear here when they share something.
              </p>

            </div>

          </div>
        )}

        {posts.map((post) => (

          <article
            key={post.id}
            className="mb-10"
          >

            {/* TIME / DELETE */}
            <div className="px-6 flex items-center justify-between">

              <span className="text-[11px] text-[#969BA4]">
                {timeAgo(post.created_at)}
              </span>

              {isOwnProfile && (
                <button
                  onClick={() =>
                    handleDeletePost(post.id)
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#969BA4] hover:bg-[#ECEEF1] hover:text-red-500 transition"
                  aria-label="Delete post"
                >
                  <Trash2
                    size={16}
                    strokeWidth={1.8}
                  />
                </button>
              )}

            </div>

            {/* IMAGE */}
            {post.image_url && (
              <div className="px-3 mt-3">

                <Link href={`/comments/${post.id}`}>

                  <div className="overflow-hidden rounded-[24px] bg-[#111318]">

                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full max-h-[620px] object-cover"
                    />

                  </div>

                </Link>

              </div>
            )}

            {/* CAPTION */}
            <div className="px-6 mt-4">

              <p className="text-[15px] leading-[1.55]">

                <span className="font-semibold mr-1.5">
                  {displayName}
                </span>

                <span className="text-[#252932]">
                  {post.content}
                </span>

              </p>

              {/* ACTIONS */}
              <div className="flex items-center gap-5 mt-4">

                <ReactionButton
                  postId={post.id}
                />

                <Link href={`/comments/${post.id}`}>

                  <button
                    className="flex items-center justify-center text-[#555B65] hover:text-[#111318] transition"
                    aria-label="Comments"
                  >
                    <MessageCircle
                      size={21}
                      strokeWidth={1.8}
                    />
                  </button>

                </Link>

              </div>

            </div>

          </article>

        ))}

      </section>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E7E9ED] px-8 py-3">

        <div className="max-w-md mx-auto flex items-center justify-between">

          <Link href="/feed">
            <div className="flex flex-col items-center gap-1 text-[#8A8F98]">
              <Home
                size={22}
                strokeWidth={1.8}
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
            className="flex flex-col items-center gap-1 text-[#111318]"
          >
            <User
              size={22}
              strokeWidth={2}
            />
            <span className="text-[10px] font-semibold">
              Profile
            </span>
          </button>

        </div>

      </nav>

    </main>
  );
}