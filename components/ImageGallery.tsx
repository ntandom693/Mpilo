"use client";

import { useState } from "react";
import Link from "next/link";

type ImageGalleryProps = {
  images: string[];
  href?: string;
};

// Swipeable photos with dots (a single photo just shows normally)
export default function ImageGallery({ images, href }: ImageGalleryProps) {
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
        {images.map((src, i) => {
          const img = (
            <img
              src={src}
              alt={`Post image ${i + 1}`}
              className={`w-full object-cover ${
                multiple ? "aspect-[4/5]" : "max-h-[620px]"
              }`}
            />
          );

          return href ? (
            <Link
              key={`${src}-${i}`}
              href={href}
              className="w-full flex-shrink-0 snap-center"
            >
              {img}
            </Link>
          ) : (
            <div
              key={`${src}-${i}`}
              className="w-full flex-shrink-0 snap-center"
            >
              {img}
            </div>
          );
        })}
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
