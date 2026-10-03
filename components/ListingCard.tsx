"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ListingCardProps = {
  title: string;
  location: string;
  price: string;
  beds: number;
  roomType: string;
  amenities: string[];
  availableFrom: string;
  color: string;
};

export default function ListingCard({
  title,
  location,
  price,
  beds,
  roomType,
  amenities,
  availableFrom,
  color,
}: ListingCardProps) {
  const router = useRouter();

  async function handleViewRoom() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/stay");
    } else {
      window.location.href = "/signup";
    }
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">

      <div className={`h-40 w-full ${color} relative`}>
        <span className="absolute top-3 left-3 bg-white/90 text-[#14161F] text-xs font-medium px-2 py-1 rounded-full">
          {roomType}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-[#4F46E5] font-semibold whitespace-nowrap">
            {price}
          </span>
        </div>

        <p className="text-[#6B7280] text-sm mt-1">{location}</p>

        <p className="text-[#6B7280] text-sm mt-1">
          {beds} {beds === 1 ? "bed" : "beds"} · Available {availableFrom}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {amenities.map((item, i) => (
            <span
              key={i}
              className="bg-[#F6F7F9] text-[#6B7280] text-xs px-2 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={handleViewRoom}
          className="mt-3 w-full bg-[#4F46E5] text-white py-2 rounded-xl font-semibold hover:bg-[#4338CA] transition"
        >
          View Room
        </button>
      </div>
    </div>
  );
}