"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Home,
  Building2,
  User,
  Calendar,
  Trash2,
  Search,
  Plus,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

type Unit = {
  room_type: string;
  price: string;
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
  units: Unit[];
};

export default function Stay() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();

      setMyId(sessionData.session?.user.id || null);

      loadListings();
    }

    async function loadListings() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const withUnits = await Promise.all(
          data.map(async (listing) => {
            if (listing.is_residence) {
              const { data: units } = await supabase
                .from("listing_units")
                .select("room_type, price")
                .eq("listing_id", listing.id);

              return {
                ...listing,
                units: units || [],
              };
            }

            return {
              ...listing,
              units: [],
            };
          })
        );

        setListings(withUnits);
      }

      setLoading(false);
    }

    init();
  }, []);

  // List a place: if not logged in, sign up / log in, then come back
  // straight to the upload page.
  async function handleUploadRoom() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/stay/upload");
    } else {
      router.push(`/signup?returnTo=${encodeURIComponent("/stay/upload")}`);
    }
  }

  // View details: if not logged in, sign up / log in, then come back
  // straight to that room.
  async function handleViewRoom(listingId: number) {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push(`/stay/room/${listingId}`);
    } else {
      router.push(
        `/signup?returnTo=${encodeURIComponent(`/stay/room/${listingId}`)}`
      );
    }
  }

  async function handleDeleteListing(listingId: number) {
    const confirmed = window.confirm(
      "Delete this listing? This can't be undone."
    );

    if (!confirmed) return;

    await supabase
      .from("listing_units")
      .delete()
      .eq("listing_id", listingId);

    await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    setListings(listings.filter((l) => l.id !== listingId));
  }

  // The /profile page decides: logged in -> your profile,
  // not logged in -> login, then your profile.
  function goToMyProfile() {
    router.push("/profile");
  }

  const filteredListings = listings.filter((listing) => {
    if (searchTerm.trim() === "") return true;

    const term = searchTerm.toLowerCase();

    return (
      (listing.area && listing.area.toLowerCase().includes(term)) ||
      (listing.location && listing.location.toLowerCase().includes(term)) ||
      listing.title.toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-28">
      {/* HEADER */}
      <header className="px-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Denverr
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Stay.</h1>
          </div>

          <button
            onClick={handleUploadRoom}
            className="flex items-center gap-2 text-sm font-semibold text-[#111318] active:scale-[0.97] transition"
          >
            <span>List a place</span>

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111318] text-white">
              <Plus size={15} strokeWidth={2.5} />
            </span>
          </button>
        </div>

        <p className="mt-3 text-[15px] leading-6 text-gray-500">
          Find somewhere that feels right.
        </p>
      </header>

      {/* SEARCH */}
      <section className="px-6 mt-7">
        <div className="relative">
          <Search
            size={18}
            strokeWidth={1.8}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D929B]"
          />

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search an area or place..."
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] pl-11 pr-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>
      </section>

      {/* TRUST MESSAGE */}
      <section className="px-6 mt-5">
        <div className="bg-white border border-[#E7E9ED] rounded-[20px] px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F1F3F5] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold">
              Student-focused accommodation
            </p>

            <p className="text-[12px] text-[#8A8F98] mt-0.5">
              Discover places close to campus.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION TITLE */}
      <section className="px-6 mt-9">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#969BA4]">
              Explore
            </p>

            <h2 className="text-[22px] font-bold tracking-[-0.025em] mt-1">
              Places to stay
            </h2>
          </div>

          {filteredListings.length > 0 && (
            <span className="text-[12px] text-[#9297A1]">
              {filteredListings.length}{" "}
              {filteredListings.length === 1 ? "listing" : "listings"}
            </span>
          )}
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="px-6 mt-8">
          <div className="bg-white border border-[#E7E9ED] rounded-[24px] p-5 animate-pulse">
            <div className="h-52 rounded-[18px] bg-[#ECEEF1]" />
            <div className="h-5 w-2/3 bg-[#ECEEF1] rounded mt-5" />
            <div className="h-4 w-1/2 bg-[#ECEEF1] rounded mt-3" />
            <div className="h-11 w-full bg-[#ECEEF1] rounded-[14px] mt-5" />
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredListings.length === 0 && (
        <section className="px-6 mt-8">
          <div className="bg-white border border-[#E7E9ED] rounded-[24px] px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F1F3F5] mx-auto flex items-center justify-center">
              <Building2 size={23} strokeWidth={1.7} />
            </div>

            <h3 className="font-semibold text-[16px] mt-5">
              {listings.length === 0
                ? "No places here yet."
                : "Nothing matches your search."}
            </h3>

            <p className="text-[#8A8F98] text-[13px] leading-5 mt-2 max-w-[280px] mx-auto">
              {listings.length === 0
                ? "Be one of the first people to put a place on Denverr."
                : "Try searching for another area or place."}
            </p>

            {listings.length === 0 && (
              <button
                onClick={handleUploadRoom}
                className="mt-6 bg-[#111318] text-white px-5 py-3 rounded-[15px] text-[13px] font-semibold active:scale-[0.98] transition"
              >
                List accommodation
              </button>
            )}
          </div>
        </section>
      )}

      {/* LISTINGS */}
      {!loading && filteredListings.length > 0 && (
        <section className="mt-6">
          {filteredListings.map((listing) => (
            <article key={listing.id} className="mb-10">
              {/* IMAGE */}
              <div className="px-3">
                <div className="relative overflow-hidden rounded-[26px] bg-[#E9EBEE]">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-[270px] object-cover"
                    />
                  ) : (
                    <div className="h-[270px] flex items-center justify-center">
                      <Building2
                        size={34}
                        strokeWidth={1.3}
                        className="text-[#A3A7AE]"
                      />
                    </div>
                  )}

                  {/* TYPE */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-[#111318] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      {listing.is_residence
                        ? "Residence"
                        : listing.room_type || "Accommodation"}
                    </span>
                  </div>

                  {/* DELETE */}
                  {listing.user_id === myId && (
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm text-[#777D86] flex items-center justify-center shadow-sm active:scale-90 transition"
                      aria-label="Delete listing"
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="px-6 mt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-tight">
                      {listing.title}
                    </h3>

                    {listing.service_provider && (
                      <p className="text-[#858A93] text-[12px] mt-1">
                        {listing.service_provider}
                      </p>
                    )}
                  </div>

                  {!listing.is_residence && listing.price && (
                    <p className="text-[18px] font-bold whitespace-nowrap">
                      {listing.price}
                    </p>
                  )}
                </div>

                {/* LOCATION */}
                <div className="flex items-center gap-1.5 mt-3 text-[#6F747D]">
                  <MapPin size={15} strokeWidth={1.8} />

                  <p className="text-[13px]">
                    {listing.area || listing.location}

                    {listing.distance_from_campus &&
                      ` · ${listing.distance_from_campus}`}
                  </p>
                </div>

                {/* AVAILABILITY */}
                {listing.available_from && (
                  <div className="flex items-center gap-1.5 mt-2 text-[#7D828B]">
                    <Calendar size={14} strokeWidth={1.8} />

                    <span className="text-[12px]">
                      Available {listing.available_from}
                    </span>
                  </div>
                )}

                {/* RESIDENCE UNITS */}
                {listing.is_residence && listing.units.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {listing.units.map((unit, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white border border-[#E7E9ED] rounded-[14px] px-4 py-3"
                      >
                        <span className="text-[13px] font-medium">
                          {unit.room_type}
                        </span>

                        <span className="text-[13px] font-semibold">
                          {unit.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* AMENITIES */}
                {listing.amenities && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {listing.amenities
                      .split(",")
                      .map((a) => a.trim())
                      .filter(Boolean)
                      .map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-[#F0F1F3] text-[#737983] text-[11px] px-3 py-1.5 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                  </div>
                )}

                {/* VIEW */}
                <button
                  onClick={() => handleViewRoom(listing.id)}
                  className="w-full mt-5 bg-[#111318] text-white rounded-[16px] py-3.5 flex items-center justify-center gap-2 text-[13px] font-semibold active:scale-[0.985] transition"
                >
                  View details
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))}
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
            <div className="flex flex-col items-center gap-1 text-[#111318]">
              <Building2 size={22} strokeWidth={2} />
              <span className="text-[10px] font-semibold">Stay</span>
            </div>
          </Link>

          <button
            onClick={goToMyProfile}
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
