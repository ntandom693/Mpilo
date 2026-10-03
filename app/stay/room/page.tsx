"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Unit = {
  room_type: string;
  price: string;
  image_url: string | null;
};

type Listing = {
  id: number;
  title: string;
  location: string;
  price: string | null;
  room_type: string | null;
  image_url: string | null;
  amenities: string | null;
  available_from: string | null;
  is_residence: boolean;
  user_id: string | null;
};

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [listerName, setListerName] = useState("the lister");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setListing(data);

        if (data.is_residence) {
          const { data: unitData } = await supabase
            .from("listing_units")
            .select("room_type, price, image_url")
            .eq("listing_id", data.id);

          if (unitData) setUnits(unitData);
        }

        if (data.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", data.user_id)
            .single();

          if (profile) {
            setListerName(`${profile.first_name} ${profile.last_name.charAt(0)}.`);
          }
        }
      }

      setLoading(false);
    }

    if (params.id) {
      loadListing();
    }
  }, [params.id]);

  function handleContact() {
    router.push(`/messages/chat?listingId=${listing?.id}`);
  }

  function toggleUnit(index: number) {
    setExpandedUnit(expandedUnit === index ? null : index);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <p className="text-[#6B7280]">Loading...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <p className="text-[#6B7280]">Not found.</p>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 pb-24">

      {listing.image_url ? (
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-56 w-full object-cover rounded-2xl"
        />
      ) : (
        <div className="h-56 w-full bg-[#E0E7FF] rounded-2xl" />
      )}

      <h1 className="text-2xl font-bold mt-4">
        {listing.title}
      </h1>

      <p className="text-[#6B7280] mt-1">
        {listing.location}
      </p>

      {listing.available_from && (
        <p className="text-[#6B7280] text-sm mt-1">
          Available {listing.available_from}
        </p>
      )}

      {!listing.is_residence ? (
        <>
          <p className="text-[#4F46E5] font-semibold text-lg mt-2">
            {listing.price}
          </p>
          <p className="text-[#14161F] mt-2">
            {listing.room_type}
          </p>
        </>
      ) : (
        <div className="mt-4">
          <p className="font-semibold mb-2">Room types available</p>
          <div className="flex flex-col gap-2">
            {units.map((unit, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                   onClick={() => toggleUnit(i)}
                     className="w-full flex justify-between items-center px-4 py-3 active:bg-red-200"
>
                  <span>{unit.room_type}</span>
                  <span className="text-[#4F46E5] font-semibold">{unit.price}</span>
                </button>

                {expandedUnit === i && (
                  <div className="px-4 pb-4">
                    {unit.image_url ? (
                      <img
                        src={unit.image_url}
                        alt={unit.room_type}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <p className="text-[#6B7280] text-sm">No photo added for this room type.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {listing.amenities && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {listing.amenities.split(",").map((a) => a.trim()).filter(Boolean).map((amenity) => (
            <span key={amenity} className="bg-[#F6F7F9] text-[#6B7280] text-xs px-2 py-1 rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-semibold">
            {listerName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{listerName}</p>
            <p className="text-[#6B7280] text-sm">{listing.is_residence ? "Manager" : "Lister"}</p>
          </div>
        </div>

        <button
          onClick={handleContact}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#4338CA] transition"
        >
          Contact
        </button>
      </div>

      <Link href="/stay">
        <p className="text-[#6B7280] mt-6 text-sm underline">
          ← Back to Stay
        </p>
      </Link>

    </main>
  );
}