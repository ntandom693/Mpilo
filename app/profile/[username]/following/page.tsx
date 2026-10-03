"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";

type Person = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

export default function FollowingPage() {
  const params = useParams();

  const [people, setPeople] = useState<Person[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowing() {
      const profileId = params.username as string;

      // Get logged-in user
      const { data: sessionData } =
        await supabase.auth.getSession();

      const currentUserId =
        sessionData.session?.user.id || null;

      setMyId(currentUserId);

      // Find people this profile follows
      const { data: followRows, error: followError } =
        await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profileId);

      if (followError) {
        console.error(followError);
        setLoading(false);
        return;
      }

      const followingUserIds =
        followRows?.map((row) => row.following_id) || [];

      if (followingUserIds.length === 0) {
        setPeople([]);
        setLoading(false);
        return;
      }

      // Get their profiles
      const { data: profiles, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "user_id, first_name, last_name, avatar_url"
          )
          .in("user_id", followingUserIds);

      if (profileError) {
        console.error(profileError);
        setLoading(false);
        return;
      }

      setPeople(profiles || []);

      // Find which of these people the current user already follows
      if (currentUserId) {
        const { data: myFollowing } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUserId)
          .in("following_id", followingUserIds);

        setFollowingIds(
          myFollowing?.map((row) => row.following_id) || []
        );
      }

      setLoading(false);
    }

    if (params.username) {
      loadFollowing();
    }
  }, [params.username]);

  async function handleFollowToggle(userId: string) {
    if (!myId) {
      window.location.href = "/signup";
      return;
    }

    const alreadyFollowing =
      followingIds.includes(userId);

    if (alreadyFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", myId)
        .eq("following_id", userId);

      if (error) {
        console.error(error);
        return;
      }

      setFollowingIds((current) =>
        current.filter((id) => id !== userId)
      );
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({
          follower_id: myId,
          following_id: userId,
        });

      if (error) {
        console.error(error);
        return;
      }

      setFollowingIds((current) => [
        ...current,
        userId,
      ]);
    }
  }

  function getDisplayName(person: Person) {
    if (!person.first_name) {
      return "Student";
    }

    return `${person.first_name} ${
      person.last_name
        ? person.last_name.charAt(0) + "."
        : ""
    }`;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-10">

      {/* TOP BAR */}
      <header className="px-5 pt-6 flex items-center justify-between">

        <Link href={`/profile/${params.username}`}>
          <div className="w-10 h-10 rounded-full bg-white border border-[#E7E9ED] flex items-center justify-center active:scale-90 transition">
            <ArrowLeft
              size={19}
              strokeWidth={1.9}
            />
          </div>
        </Link>

        <p className="text-[12px] font-semibold tracking-[0.12em] text-[#9297A1]">
          FOLLOWING
        </p>

        <div className="w-10 h-10" />

      </header>

      {/* HEADER */}
      <section className="px-6 mt-10">

        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#969BA4]">
          People
        </p>

        <h1 className="text-[30px] font-bold tracking-[-0.04em] mt-1">
          Following
        </h1>

        {!loading && (
          <p className="text-[13px] text-[#9297A1] mt-2">
            {people.length}{" "}
            {people.length === 1
              ? "person followed"
              : "people followed"}{" "}
            by this profile.
          </p>
        )}

      </section>

      {/* PEOPLE */}
      <section className="px-6 mt-7">

        {loading && (
          <div className="space-y-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[76px] bg-white border border-[#E7E9ED] rounded-[20px] animate-pulse"
              />
            ))}

          </div>
        )}

        {!loading && people.length === 0 && (
          <div className="bg-white border border-[#E7E9ED] rounded-[22px] px-6 py-12 text-center">

            <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F1F3] flex items-center justify-center">
              <UserPlus
                size={21}
                strokeWidth={1.8}
                className="text-[#777D86]"
              />
            </div>

            <p className="text-[15px] font-semibold mt-4">
              Not following anyone yet.
            </p>

            <p className="text-[12px] text-[#9297A1] mt-2">
              People this profile follows will appear here.
            </p>

          </div>
        )}

        {!loading && people.length > 0 && (
          <div className="space-y-3">

            {people.map((person) => {
              const displayName =
                getDisplayName(person);

              const isFollowing =
                followingIds.includes(person.user_id);

              const isMe =
                myId === person.user_id;

              return (
                <div
                  key={person.user_id}
                  className="bg-white border border-[#E7E9ED] rounded-[20px] px-4 py-3.5 flex items-center gap-3"
                >

                  {/* AVATAR + NAME */}
                  <Link
                    href={`/profile/${person.user_id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >

                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#111318] text-white flex items-center justify-center text-[16px] font-semibold flex-shrink-0">
                        {person.first_name
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="text-[15px] font-semibold truncate">
                        {displayName}
                      </p>

                      <p className="text-[11px] text-[#9297A1] mt-0.5">
                        Student
                      </p>

                    </div>

                  </Link>

                  {/* FOLLOW BUTTON */}
                  {!isMe && (
                    <button
                      onClick={() =>
                        handleFollowToggle(
                          person.user_id
                        )
                      }
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[12px] font-semibold flex-shrink-0 active:scale-[0.96] transition ${
                        isFollowing
                          ? "bg-white border border-[#DDE0E5] text-[#111318]"
                          : "bg-[#111318] text-white"
                      }`}
                    >

                      {isFollowing ? (
                        <>
                          <UserCheck
                            size={14}
                            strokeWidth={2}
                          />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus
                            size={14}
                            strokeWidth={2}
                          />
                          Follow
                        </>
                      )}

                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
}