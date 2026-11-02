"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Check, Trash2, Building2 } from "lucide-react";

// ------------------------------------------------------------------
// CHANGE THIS to the email you sign in to Denverr with.
// Only this account can open the admin page. Everyone else is sent
// back to Stay.
// ------------------------------------------------------------------
const ADMIN_EMAIL = "ekse@gmail.com";

type AdminListing = {
  id: number;
  title: string;
  service_provider: string | null;
  area: string | null;
  location: string | null;
  phone_number: string | null;
  price: string | null;
  room_type: string | null;
  payment_type: string | null;
  is_residence: boolean;
  is_verified: boolean | null;
  image_url: string | null;
};

type StatusFilter = "all" | "pending" | "verified";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "To check" },
  { value: "verified", label: "Verified" },
];

function paymentTypeLabel(type: string | null) {
  if (type === "nsfas") return "NSFAS only";
  if (type === "self") return "Self-paying only";
  if (type === "both") return "NSFAS & self-paying";
  return null;
}

// Same small dark circle + white tick used on Stay.
function VerifiedTick() {
  return (
    <span
      aria-label="Verified"
      title="Verified"
      className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111318] text-white align-middle"
    >
      <Check size={11} strokeWidth={3.2} />
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      // Not logged in: go log in, then come straight back here.
      if (!session) {
        router.replace(`/signup?returnTo=${encodeURIComponent("/admin")}`);
        return;
      }

      // Logged in but not the admin account: send away.
      const email = session.user.email?.toLowerCase();

      if (!email || email !== ADMIN_EMAIL.toLowerCase()) {
        router.replace("/stay");
        return;
      }

      setAllowed(true);
      setChecking(false);

      const { data: rows } = await supabase
        .from("listings")
        .select(
          "id, title, service_provider, area, location, phone_number, price, room_type, payment_type, is_residence, is_verified, image_url"
        )
        .order("created_at", { ascending: false });

      setListings((rows as AdminListing[]) || []);
      setLoading(false);
    }

    init();
  }, [router]);

  async function toggleVerified(listing: AdminListing) {
    const next = !listing.is_verified;

    setBusyId(listing.id);

    const { error } = await supabase
      .from("listings")
      .update({ is_verified: next })
      .eq("id", listing.id);

    if (error) {
      alert("Could not update: " + error.message);
    } else {
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, is_verified: next } : l
        )
      );
    }

    setBusyId(null);
  }

  async function deleteListing(listing: AdminListing) {
    const confirmed = window.confirm(
      `Delete "${listing.title}"? This can't be undone.`
    );

    if (!confirmed) return;

    setBusyId(listing.id);

    await supabase.from("listing_units").delete().eq("listing_id", listing.id);

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (error) {
      alert("Could not delete: " + error.message);
    } else {
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    }

    setBusyId(null);
  }

  if (checking || !allowed) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#E7E9ED] border-t-[#111318] animate-spin" />
      </main>
    );
  }

  const verifiedCount = listings.filter((l) => l.is_verified).length;
  const pendingCount = listings.length - verifiedCount;

  const shown = listings.filter((l) => {
    if (filter === "verified") return !!l.is_verified;
    if (filter === "pending") return !l.is_verified;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-16">
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

        <span className="text-[15px] font-semibold">Admin</span>

        <div className="w-10" />
      </div>

      <header className="px-6 mt-6">
        <h1 className="text-3xl font-bold tracking-tight">Listings.</h1>

        <p className="mt-2 text-[14px] text-[#7A7D85]">
          {verifiedCount} verified · {pendingCount} to check
        </p>
      </header>

      {/* Filter */}
      <section className="px-6 mt-5">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={
                filter === f.value
                  ? "bg-[#111318] text-white px-4 py-2 rounded-full text-[13px] font-medium transition"
                  : "bg-white border border-[#E7E9ED] text-[#555860] px-4 py-2 rounded-full text-[13px] font-medium transition"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="px-6 mt-6">
          <div className="bg-white border border-[#E7E9ED] rounded-[22px] p-5 animate-pulse">
            <div className="h-5 w-2/3 bg-[#ECEEF1] rounded" />
            <div className="h-4 w-1/2 bg-[#ECEEF1] rounded mt-3" />
            <div className="h-10 w-full bg-[#ECEEF1] rounded-[14px] mt-5" />
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && shown.length === 0 && (
        <section className="px-6 mt-6">
          <div className="bg-white border border-[#E7E9ED] rounded-[22px] px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F1F3F5] mx-auto flex items-center justify-center">
              <Building2 size={21} strokeWidth={1.7} />
            </div>

            <p className="mt-4 text-[15px] font-semibold">
              {filter === "verified"
                ? "No verified listings yet."
                : filter === "pending"
                ? "Nothing left to check."
                : "No listings yet."}
            </p>
          </div>
        </section>
      )}

      {/* Listings */}
      {!loading && shown.length > 0 && (
        <section className="px-6 mt-6 flex flex-col gap-3">
          {shown.map((listing) => {
            const paymentLabel = paymentTypeLabel(listing.payment_type);
            const placeText = listing.area || listing.location;
            const busy = busyId === listing.id;

            return (
              <article
                key={listing.id}
                className="bg-white border border-[#E7E9ED] rounded-[22px] p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-[14px] bg-[#ECEEF1] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2
                        size={20}
                        strokeWidth={1.4}
                        className="text-[#A3A7AE]"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-bold tracking-[-0.02em] leading-tight">
                      {listing.title}
                      {listing.is_verified && (
                        <span className="ml-2 inline-block align-middle -mt-0.5">
                          <VerifiedTick />
                        </span>
                      )}
                    </h3>

                    <p className="text-[12px] text-[#858A93] mt-1">
                      {[
                        listing.is_residence ? "Residence" : listing.room_type,
                        placeText,
                        listing.is_residence ? null : listing.price,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <p className="text-[12px] text-[#858A93] mt-0.5">
                      {[
                        listing.service_provider,
                        listing.phone_number,
                        paymentLabel,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                {/* Status — only visible here, never on Stay */}
                <p className="mt-3 text-[12px] font-medium text-[#9297A1]">
                  {listing.is_verified ? "Verified" : "Not verified"}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleVerified(listing)}
                    disabled={busy}
                    className={
                      listing.is_verified
                        ? "flex-1 bg-white border border-[#E7E9ED] text-[#111318] py-3 rounded-[14px] text-[13px] font-semibold disabled:opacity-40 active:scale-[0.985] transition"
                        : "flex-1 bg-[#111318] text-white py-3 rounded-[14px] text-[13px] font-semibold disabled:opacity-40 active:scale-[0.985] transition"
                    }
                  >
                    {busy
                      ? "Saving..."
                      : listing.is_verified
                      ? "Unverify"
                      : "Verify"}
                  </button>

                  <Link
                    href={`/stay/room/${listing.id}`}
                    className="bg-white border border-[#E7E9ED] text-[#111318] px-4 py-3 rounded-[14px] text-[13px] font-semibold active:scale-[0.985] transition"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => deleteListing(listing)}
                    disabled={busy}
                    className="w-11 h-11 rounded-[14px] bg-white border border-[#E7E9ED] text-[#777D86] flex items-center justify-center disabled:opacity-40 active:scale-90 transition"
                    aria-label="Delete listing"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
