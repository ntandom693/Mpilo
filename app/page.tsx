import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#F7F8FA] text-[#111318] flex flex-col px-6">

      {/* CENTER */}
      <section className="flex-1 flex flex-col items-center justify-center text-center">

        <img
          src="/logo.png"
          alt="Denverr"
          className="w-[72px] h-[72px] rounded-[16px] shadow-sm"
        />

        <h1 className="mt-6 text-[28px] leading-none font-semibold tracking-[-0.04em]">
          Denverr
        </h1>

        <p className="mt-3 text-[15px] text-[#6F727B]">
          Your campus, your people.
        </p>

      </section>

      {/* BOTTOM */}
      <section className="w-full max-w-sm mx-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">

        <Link
          href="/feed"
          className="block w-full text-center bg-white border border-[#E7E8EC] text-[#111318] py-4 rounded-2xl font-semibold text-[15px] active:scale-[0.99] transition"
        >
          Explore
        </Link>

        <Link
          href="/signup?returnTo=/feed"
          className="block w-full text-center mt-3 bg-[#111318] text-white py-4 rounded-2xl font-semibold text-[15px] active:scale-[0.99] transition"
        >
          Join Denverr
        </Link>

        <p className="text-center text-sm text-[#7A7D85] mt-5">
          Already on Denverr?{" "}
          <Link
            href="/login?returnTo=/feed"
            className="text-[#111318] font-semibold"
          >
            Log in
          </Link>
        </p>

        <p className="text-center text-[11px] text-[#9A9DA5] mt-4">
          <Link href="/privacy" className="hover:text-[#111318] transition">
            Privacy Policy
          </Link>

          <span className="mx-2">·</span>

          <Link href="/terms" className="hover:text-[#111318] transition">
            Terms of Use
          </Link>
        </p>

      </section>

    </main>
  );
}
