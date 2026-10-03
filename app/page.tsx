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
            href="/feed"
            className="text-sm font-medium text-gray-500 hover:text-[#111318] transition"
          >
            Explore
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Your digital campus
          </p>

          <h1 className="mt-5 text-6xl sm:text-8xl font-bold tracking-[-0.06em]">
            Denverr
          </h1>

          <p className="mt-5 text-lg text-gray-500">
            Your campus, your people.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">

            <Link
              href="/feed"
              className="px-6 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition"
            >
              Explore
            </Link>

            <Link
              href="/signup?returnTo=/"
              className="px-6 py-3 rounded-full bg-[#111318] text-white text-sm font-semibold hover:bg-black active:scale-[0.98] transition"
            >
              Join Denverr
            </Link>

          </div>

          {/* PRODUCT PREVIEW */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">

            <Link
              href="/feed"
              className="rounded-[24px] bg-white border border-gray-200/70 p-5 text-left shadow-sm hover:-translate-y-0.5 transition"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Feed
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                See what's happening.
              </h2>

              <p className="mt-1.5 text-sm text-gray-500">
                What's happening around your campus.
              </p>
            </Link>

            <Link
              href="/stay"
              className="rounded-[24px] bg-[#111318] p-5 text-left text-white shadow-sm hover:-translate-y-0.5 transition"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Stay
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Find your place.
              </h2>

              <p className="mt-1.5 text-sm text-white/55">
                Student-focused places to stay.
              </p>
            </Link>

          </div>

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