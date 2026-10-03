"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Camera, X, Image as ImageIcon } from "lucide-react";

export default function Compose() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];

    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  function removePhoto() {
    setFile(null);
    setPreview(null);
  }

  async function handlePost() {
    if (!text.trim() || uploading) return;

    setUploading(true);

    let imageUrl = null;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (error) {
        alert("Photo upload failed: " + error.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { data: sessionData } = await supabase.auth.getSession();

    const { error: insertError } = await supabase.from("posts").insert({
      content: text,
      image_url: imageUrl,
      user_id: sessionData.session?.user.id,
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
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] px-5 pt-5 pb-8">

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
          disabled={text.trim() === "" || uploading}
          className="text-[15px] font-semibold text-[#111318] disabled:text-[#B8BAC1] transition"
        >
          {uploading ? "Posting..." : "Post"}
        </button>

      </div>

      {/* Composer */}
      <section className="mt-8">

        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold text-sm shrink-0">
            D
          </div>

          <div className="flex-1 pt-1">

            <p className="text-[15px] font-semibold mb-3">
              Your campus
            </p>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share something..."
              className="w-full bg-transparent text-[21px] leading-[1.45] tracking-[-0.02em] placeholder-[#A2A5AD] resize-none focus:outline-none min-h-[180px]"
            />

          </div>

        </div>

      </section>

      {/* Photo preview */}
      {preview && (
        <div className="relative mt-4 rounded-[24px] overflow-hidden bg-white border border-[#E7E8EC]">

          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-[430px] object-cover"
          />

          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm active:scale-95 transition"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* Bottom tools */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F8FA]/95 backdrop-blur-xl border-t border-[#E7E8EC] px-5 py-4">

        <div className="max-w-xl mx-auto flex items-center justify-between">

          <label className="cursor-pointer">

            <div className="flex items-center gap-2 text-[#111318]">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center">
                <ImageIcon size={19} />
              </div>

              <span className="text-sm font-medium">
                Photo
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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