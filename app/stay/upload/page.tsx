"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const AMENITY_OPTIONS = ["Wifi", "Laundry", "Furnished", "Parking", "Water included", "Electricity included"];
const ROOM_TYPES = ["Bachelor", "Private room", "Shared room", "Studio"];

type Unit = {
  roomType: string;
  price: string;
  file: File | null;
  preview: string | null;
};

export default function UploadRoom() {
  const [isResidence, setIsResidence] = useState(false);
  const [title, setTitle] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [area, setArea] = useState("");
  const [distanceFromCampus, setDistanceFromCampus] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [units, setUnits] = useState<Unit[]>([{ roomType: "", price: "", file: null, preview: null }]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }

  function addUnit() {
    setUnits([...units, { roomType: "", price: "", file: null, preview: null }]);
  }

  function updateUnit(index: number, field: "roomType" | "price", value: string) {
    const updated = [...units];
    updated[index][field] = value;
    setUnits(updated);
  }

  function updateUnitFile(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      const updated = [...units];
      updated[index].file = selected;
      updated[index].preview = URL.createObjectURL(selected);
      setUnits(updated);
    }
  }

  function removeUnit(index: number) {
    setUnits(units.filter((_, i) => i !== index));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function uploadPhoto(fileToUpload: File) {
    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { error } = await supabase.storage.from("photos").upload(fileName, fileToUpload);

    if (error) return null;

    const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handlePost() {
    setUploading(true);

    let imageUrl = null;

    if (file) {
      imageUrl = await uploadPhoto(file);
    }

    const { data: sessionData } = await supabase.auth.getSession();

    const { data: newListing, error: insertError } = await supabase
      .from("listings")
      .insert({
        title,
        service_provider: serviceProvider,
        area,
        distance_from_campus: distanceFromCampus,
        price: isResidence ? null : price,
        room_type: isResidence ? null : roomType,
        image_url: imageUrl,
        user_id: sessionData.session?.user.id,
        amenities: selectedAmenities.join(", "),
        available_from: availableFrom,
        is_residence: isResidence,
        phone_number: phoneNumber,
      })
      .select()
      .single();

    if (insertError || !newListing) {
      alert("Listing failed to save: " + insertError?.message);
      setUploading(false);
      return;
    }

    if (isResidence) {
      const validUnits = units.filter((u) => u.roomType.trim() !== "" && u.price.trim() !== "");

      for (const unit of validUnits) {
        let unitImageUrl = null;
        if (unit.file) {
          unitImageUrl = await uploadPhoto(unit.file);
        }

        await supabase.from("listing_units").insert({
          listing_id: newListing.id,
          room_type: unit.roomType,
          price: unit.price,
          image_url: unitImageUrl,
        });
      }
    }

    setUploading(false);
    router.push("/stay");
  }

  const canPost = isResidence
    ? title.trim() !== "" &&
      area.trim() !== "" &&
      phoneNumber.trim() !== "" &&
      units.some((u) => u.roomType.trim() !== "" && u.price.trim() !== "")
    : title.trim() !== "" &&
      area.trim() !== "" &&
      price.trim() !== "" &&
      roomType.trim() !== "" &&
      phoneNumber.trim() !== "";

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

        <span className="text-[15px] font-semibold">List accommodation</span>

        <div className="w-10" />
      </div>

      <p className="px-5 mt-4 text-[14px] text-[#7A7D85]">
        Give students the details they need to know if it&apos;s a fit.
      </p>

      {/* Residence toggle */}
      <div className="px-5 mt-5">
        <button
          type="button"
          onClick={() => setIsResidence(!isResidence)}
          className="w-full bg-white border border-[#E7E9ED] rounded-[18px] px-4 py-3.5 flex items-center justify-between"
        >
          <span className="text-[13px] font-medium">This is a residence with multiple room types</span>
          <span
            className={`flex-shrink-0 w-11 h-6 rounded-full relative transition ${
              isResidence ? "bg-[#111318]" : "bg-[#E7E9ED]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                isResidence ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-4">

        {/* Cover photo */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-[22px]"
          />
        )}

        <label className="inline-flex items-center justify-center bg-white border border-[#E7E9ED] px-4 py-3 rounded-[16px] text-[13px] font-medium cursor-pointer">
          📷 {preview ? "Change cover photo" : "Add cover photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Property name
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isResidence ? "e.g. Sunrise Student Residence" : "e.g. Cozy room near main gate"}
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Service provider (optional)
          </p>
          <input
            value={serviceProvider}
            onChange={(e) => setServiceProvider(e.target.value)}
            placeholder="e.g. Campus Living, or leave blank"
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Area
          </p>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Universitas, Willows"
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Distance from campus
          </p>
          <input
            value={distanceFromCampus}
            onChange={(e) => setDistanceFromCampus(e.target.value)}
            placeholder="e.g. 5 min walk"
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            WhatsApp number
          </p>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 0812345678"
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
          <p className="text-[#9A9DA5] text-xs mt-1.5">Students will message you here about this listing.</p>
        </div>

        {!isResidence ? (
          <>
            <div>
              <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
                Room type
              </p>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none focus:border-[#C9CDD4] transition"
              >
                <option value="">Select a type</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
                Price per month
              </p>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. R2,800/mo"
                className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
              />
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
              Room types available
            </p>

            <div className="flex flex-col gap-3">
              {units.map((unit, index) => (
                <div key={index} className="bg-white border border-[#E7E9ED] rounded-[20px] p-4">
                  {unit.preview && (
                    <img
                      src={unit.preview}
                      alt="Room type preview"
                      className="w-full h-32 object-cover rounded-[16px] mb-3"
                    />
                  )}

                  <label className="inline-flex items-center bg-[#F7F8FA] px-3 py-1.5 rounded-[12px] text-xs font-medium cursor-pointer mb-3">
                    📷 {unit.preview ? "Change photo" : "Add photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateUnitFile(index, e)}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={unit.roomType}
                      onChange={(e) => updateUnit(index, "roomType", e.target.value)}
                      className="flex-1 bg-white border border-[#E7E9ED] rounded-[14px] p-2.5 text-sm outline-none"
                    >
                      <option value="">Select type</option>
                      {ROOM_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <input
                      value={unit.price}
                      onChange={(e) => updateUnit(index, "price", e.target.value)}
                      placeholder="R2,800/mo"
                      className="w-32 bg-white border border-[#E7E9ED] rounded-[14px] p-2.5 text-sm outline-none"
                    />

                    {units.length > 1 && (
                      <button
                        onClick={() => removeUnit(index)}
                        className="text-red-500 text-sm px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addUnit}
              className="mt-3 text-[#111318] text-sm font-semibold"
            >
              + Add another room type
            </button>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Available from
          </p>
          <input
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            placeholder="e.g. Jan 2027"
            className="w-full h-[52px] bg-white border border-[#E7E9ED] rounded-[18px] px-4 text-[14px] outline-none placeholder:text-[#A2A6AE] focus:border-[#C9CDD4] transition"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#8B8E97] uppercase tracking-[0.08em] mb-1.5">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={
                  selectedAmenities.includes(amenity)
                    ? "bg-[#111318] text-white px-3.5 py-2 rounded-full text-sm font-medium"
                    : "bg-white border border-[#E7E9ED] text-[#555860] px-3.5 py-2 rounded-full text-sm font-medium"
                }
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F8FA]/95 backdrop-blur-xl border-t border-[#E7E8EC] px-5 py-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handlePost}
            disabled={!canPost || uploading}
            className="w-full bg-[#111318] text-white py-4 rounded-2xl font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition"
          >
            {uploading ? "Posting..." : "List accommodation"}
          </button>
        </div>
      </div>

    </main>
  );
}