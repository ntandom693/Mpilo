import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] flex flex-col">

      {/* HEADER */}
      <header className="w-full px-6 pt-7">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Denverr
          </span>

          <Link
            href="/login?returnTo=/feed"
            className="text-sm font-semibold text-[#111318] hover:opacity-70 transition"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">

          <h1 className="text-5xl sm:text-6xl font-bold tracking-[-0.05em] leading-[1.03]">
            Your campus,
            <br />
            your people.
          </h1>

          <p className="mt-5 text-[17px] leading-7 text-gray-500">
            Share what's happening and find a place to stay.
          </p>

          <div className="mt-9 flex flex-col gap-3">

            <Link
              href="/signup?returnTo=/feed"
              className="w-full py-4 rounded-full bg-[#111318] text-white text-[15px] font-semibold hover:bg-black active:scale-[0.98] transition"
            >
              Join Denverr
            </Link>

            <Link
              href="/feed"
              className="w-full py-4 rounded-full bg-white border border-gray-200 text-[15px] font-semibold hover:bg-gray-50 active:scale-[0.98] transition"
            >
              Explore
            </Link>

          </div>

          <Link
            href="/stay"
            className="mt-8 inline-block text-sm text-gray-500 hover:text-[#111318] transition"
          >
            Looking for a place to stay?{" "}
            <span className="font-semibold text-[#111318]">Browse Stay →</span>
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="pb-6 text-center text-xs text-gray-400">
        <Link href="/privacy" className="hover:text-[#111318] transition">
          Privacy Policy
        </Link>

        <span className="mx-2">·</span>

        <Link href="/terms" className="hover:text-[#111318] transition">
          Terms of Use
        </Link>
      </footer>

    </main>
  );
}
