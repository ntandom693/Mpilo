"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

type Unit = {
  room_type: string;
  price: string;
  image_url: string | null;
};

type Listing = {
  id: number;
  title: string;
  service_provider: string | null;
  area: string | null;
  distance_from_campus: string | null;
  location: string | null;
  price: string | null;
  room_type: string | null;
  image_url: string | null;
  amenities: string | null;
  available_from: string | null;
  is_residence: boolean;
  user_id: string | null;
  phone_number: string | null;
};

function formatForWhatsApp(phone: string) {
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.startsWith("0")) {
    return "27" + digitsOnly.slice(1);
  }

  return digitsOnly;
}

export default function RoomDetail() {
  const params = useParams();

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

          if (unitData) {
            setUnits(unitData);
          }
        }

        if (data.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", data.user_id)
            .single();

          if (profile) {
            setListerName(
              `${profile.first_name} ${profile.last_name.charAt(0)}.`
            );
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
    if (!listing?.phone_number) {
      alert("No contact number available for this listing.");
      return;
    }

    const whatsappNumber = formatForWhatsApp(listing.phone_number);

    const message = `Hi, I'm interested in your listing "${listing.title}" on Denverr. Is it still available?`;

    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  function toggleUnit(index: number) {
    setExpandedUnit(expandedUnit === index ? null : index);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] px-5 py-6">

        <div className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] animate-pulse" />

        <div className="mt-5 h-[330px] w-full rounded-[28px] bg-[#ECEEF1] animate-pulse" />

        <div className="mt-6 h-8 w-2/3 rounded-lg bg-[#ECEEF1] animate-pulse" />

        <div className="mt-3 h-5 w-1/3 rounded-lg bg-[#ECEEF1] animate-pulse" />

        <div className="mt-8 h-20 rounded-2xl bg-[#ECEEF1] animate-pulse" />

      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#111318]">
            Listing not found
          </p>

          <Link
            href="/stay"
            className="inline-block mt-3 text-sm font-medium text-[#6F727B]"
          >
            Back to Stay
          </Link>
        </div>
      </main>
    );
  }

  const amenities = listing.amenities
    ? listing.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  const locationText = listing.area || listing.location;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-32">

      {/* Header */}
      <div className="px-5 pt-5 flex items-center justify-between">

        <Link href="/stay">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-[#E7E8EC] flex items-center justify-center active:scale-95 transition"
          >
            <ArrowLeft size={19} />
          </button>
        </Link>

        <span className="text-[15px] font-semibold">
          Stay
        </span>

        <div className="w-10" />

      </div>

      {/* Hero image */}
      <div className="px-5 mt-5">

        <div className="relative overflow-hidden rounded-[28px] bg-[#ECEEF1]">

          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-[360px] object-cover"
            />
          ) : (
            <div className="w-full h-[360px] flex items-center justify-center">
              <span className="text-sm text-[#9A9DA5]">
                No photo available
              </span>
            </div>
          )}

          {/* Verification */}
          <div className="absolute top-4 left-4">

            <div className="bg-white/95 backdrop-blur-md rounded-full px-3 py-2 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={15} />
              <span className="text-xs font-semibold">
                Denverr listing
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Main information */}
      <section className="px-5 mt-7">

        <div className="flex items-start justify-between gap-5">

          <div>

            <h1 className="text-[28px] leading-[1.08] font-semibold tracking-[-0.035em]">
              {listing.title}
            </h1>

            {listing.service_provider && (
              <p className="text-sm text-[#7A7D85] mt-2">
                {listing.service_provider}
              </p>
            )}

          </div>

          {!listing.is_residence && listing.price && (
            <div className="text-right shrink-0">

              <p className="text-xl font-semibold tracking-[-0.02em]">
                {listing.price}
              </p>

              <p className="text-xs text-[#9A9DA5] mt-0.5">
                per month
              </p>

            </div>
          )}

        </div>

        {/* Location */}
        {(locationText || listing.distance_from_campus) && (
          <div className="mt-5 flex items-center gap-2 text-[#6F727B]">

            <MapPin size={17} />

            <p className="text-sm">
              {locationText}

              {listing.distance_from_campus && (
                <>
                  {" · "}
                  {listing.distance_from_campus}
                </>
              )}
            </p>

          </div>
        )}

        {/* Availability */}
        {listing.available_from && (
          <div className="mt-3 inline-flex items-center rounded-full bg-white border border-[#E7E8EC] px-3 py-2">

            <span className="text-xs text-[#6F727B]">
              Available {listing.available_from}
            </span>

          </div>
        )}

      </section>

      {/* Room type */}
      {!listing.is_residence && (
        <section className="px-5 mt-8">

          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em]">
            Room
          </p>

          <p className="mt-2 text-[17px] font-medium">
            {listing.room_type || "Room type not specified"}
          </p>

        </section>
      )}

      {/* Residence units */}
      {listing.is_residence && (
        <section className="px-5 mt-8">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em]">
                Available rooms
              </p>

              <p className="text-xl font-semibold mt-1">
                Choose your room
              </p>
            </div>

            <span className="text-xs text-[#9A9DA5]">
              {units.length} option{units.length === 1 ? "" : "s"}
            </span>

          </div>

          <div className="mt-4 space-y-3">

            {units.map((unit, i) => (
              <div
                key={i}
                className="bg-white border border-[#E7E8EC] rounded-[22px] overflow-hidden"
              >

                <button
                  onClick={() => toggleUnit(i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >

                  <div>
                    <p className="font-semibold text-[15px]">
                      {unit.room_type}
                    </p>

                    <p className="text-sm text-[#7A7D85] mt-1">
                      {unit.price}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#F7F8FA] flex items-center justify-center">

                    <ChevronDown
                      size={18}
                      className={`text-[#6F727B] transition-transform ${
                        expandedUnit === i ? "rotate-180" : ""
                      }`}
                    />

                  </div>

                </button>

                {expandedUnit === i && (
                  <div className="px-4 pb-4">

                    {unit.image_url ? (
                      <img
                        src={unit.image_url}
                        alt={unit.room_type}
                        className="w-full h-48 object-cover rounded-[18px]"
                      />
                    ) : (
                      <div className="rounded-[18px] bg-[#F7F8FA] py-10 text-center">
                        <p className="text-sm text-[#9A9DA5]">
                          No photo added for this room type.
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}

          </div>

        </section>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <section className="px-5 mt-9">

          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em]">
            What's included
          </p>

          <div className="flex flex-wrap gap-2 mt-3">

            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="bg-white border border-[#E7E8EC] rounded-full px-3.5 py-2 text-sm text-[#555860]"
              >
                {amenity}
              </span>
            ))}

          </div>

        </section>
      )}

      {/* Lister */}
      <section className="px-5 mt-9">

        <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em]">
          Listed by
        </p>

        <div className="mt-3 bg-white border border-[#E7E8EC] rounded-[22px] p-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold">
              {listerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold">
                {listerName}
              </p>

              <p className="text-xs text-[#8B8E97] mt-0.5">
                {listing.is_residence ? "Accommodation manager" : "Student lister"}
              </p>
            </div>

          </div>

          <ShieldCheck size={19} className="text-[#111318]" />

        </div>

      </section>

      {/* Fixed contact action */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F8FA]/95 backdrop-blur-xl border-t border-[#E7E8EC] px-5 py-4">

        <div className="max-w-xl mx-auto">

          <button
            onClick={handleContact}
            className="w-full bg-[#111318] text-white py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <MessageCircle size={18} />
            Contact on WhatsApp
          </button>

        </div>

      </div>

    </main>
  );
}