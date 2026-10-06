"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, X, Image as ImageIcon } from "lucide-react";

const MAX_PHOTOS = 10;

export default function Compose() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [myInitial, setMyInitial] = useState("D");
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      // Not logged in: sign up / log in, then come back here
      if (!user) {
        router.replace(`/signup?returnTo=${encodeURIComponent("/compose")}`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setMyAvatar(profile.avatar_url);
        if (profile.first_name) {
          setMyInitial(profile.first_name.charAt(0).toUpperCase());
        }
      }
    }

    init();
  }, [router]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);

    // Reset so the same photo can be picked again later
    e.target.value = "";

    if (selected.length === 0) return;

    const room = MAX_PHOTOS - files.length;
    const toAdd = selected.slice(0, room);

    if (selected.length > room) {
      alert(`You can add up to ${MAX_PHOTOS} photos per post.`);
    }

    setFiles([...files, ...toAdd]);
    setPreviews([...previews, ...toAdd.map((f) => URL.createObjectURL(f))]);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index]);

    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  }

  const canPost = (text.trim() !== "" || files.length > 0) && !uploading;

  async function handlePost() {
    if (!canPost) return;

    setUploading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setUploading(false);
      router.push(`/signup?returnTo=${encodeURIComponent("/compose")}`);
      return;
    }

    let imageUrls: string[] = [];

    if (files.length > 0) {
      try {
        imageUrls = await Promise.all(
          files.map(async (file, i) => {
            const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
            const fileName = `${Date.now()}-${i}-${safeName}`;

            const { error } = await supabase.storage
              .from("photos")
              .upload(fileName, file);

            if (error) throw error;

            const { data } = supabase.storage
              .from("photos")
              .getPublicUrl(fileName);

            return data.publicUrl;
          })
        );
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Please try again.";
        alert("Photo upload failed: " + message);
        setUploading(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from("posts").insert({
      content: text,
      image_url: imageUrls[0] || null,
      image_urls: imageUrls,
      user_id: userId,
    });

    if (insertError) {
      alert("Post failed to save: " + insertError.message);
      setUploading(false);
      return;
    }

    setUploading(false);
    router.push("/feed");
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] px-5 pt-5 pb-32">

      {/* Top bar */}
      <div className="flex items-center justify-between">

        <Link href="/feed">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center text-[#111318] active:scale-95 transition"
          >
            <ArrowLeft size={19} strokeWidth={2} />
          </button>
        </Link>

        <h1 className="text-[17px] font-semibold tracking-[-0.02em]">
          Share
        </h1>

        <button
          type="button"
          onClick={handlePost}
          disabled={!canPost}
          className="text-[15px] font-semibold text-[#111318] disabled:text-[#B8BAC1] transition"
        >
          {uploading ? "Posting..." : "Post"}
        </button>

      </div>

      {/* Composer */}
      <section className="mt-8">

        <div className="flex items-start gap-3">

          {myAvatar ? (
            <img
              src={myAvatar}
              alt="You"
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {myInitial}
            </div>
          )}

          <div className="flex-1 pt-1">

            <p className="text-[15px] font-semibold mb-3">
              Your campus
            </p>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share something..."
              className="w-full bg-transparent text-[21px] leading-[1.45] tracking-[-0.02em] placeholder-[#A2A5AD] resize-none focus:outline-none min-h-[140px]"
            />

          </div>

        </div>

      </section>

      {/* Photo previews */}
      {previews.length > 0 && (
        <div
          className={`mt-4 ${
            previews.length === 1 ? "" : "grid grid-cols-2 gap-2"
          }`}
        >
          {previews.map((src, index) => (
            <div
              key={src}
              className="relative rounded-[24px] overflow-hidden bg-white border border-[#E7E8EC]"
            >
              <img
                src={src}
                alt={`Photo ${index + 1}`}
                className={`w-full object-cover ${
                  previews.length === 1 ? "max-h-[430px]" : "aspect-square"
                }`}
              />

              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm active:scale-95 transition"
                aria-label="Remove photo"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom tools */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F8FA]/95 backdrop-blur-xl border-t border-[#E7E8EC] px-5 py-4">

        <div className="max-w-xl mx-auto flex items-center justify-between">

          <label
            className={`cursor-pointer ${
              files.length >= MAX_PHOTOS ? "opacity-40 pointer-events-none" : ""
            }`}
          >

            <div className="flex items-center gap-2 text-[#111318]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center">
                <ImageIcon size={19} />
              </div>

              <span className="text-sm font-medium">
                {files.length > 0
                  ? `Photos ${files.length}/${MAX_PHOTOS}`
                  : "Photos"}
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />

          </label>

          <div className="text-xs text-[#9A9DA5]">
            {text.length > 0 ? `${text.length}` : ""}
          </div>

        </div>

      </div>

    </main>
  );
}
