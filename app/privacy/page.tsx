import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 max-w-2xl mx-auto">

      <Link href="/">
        <span className="text-[#6B7280] font-medium cursor-pointer">← Back</span>
      </Link>

      <h1 className="text-2xl font-bold mt-4">Privacy Policy</h1>
      <p className="text-[#6B7280] text-sm mt-1">Last updated: September 2026</p>

      <div className="mt-6 flex flex-col gap-6 text-[#14161F] leading-relaxed">

        <p>
          Denverr ("we," "us," "Denverr") is a social platform for university students. This
          policy explains what personal information we collect, why, and how you can control it.
        </p>

        <section>
          <h2 className="font-semibold text-lg mb-1">1. What we collect</h2>
          <p>When you use Denverr, we collect:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
            <li>Your email address and password (to create and secure your account)</li>
            <li>Your first name, last name, and profile photo (if you add one)</li>
            <li>Content you post: feed posts, comments, likes, and follows</li>
            <li>Accommodation listings you post, including a WhatsApp contact number you choose to share</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">2. Why we collect it</h2>
          <p>
            We use this information to run the platform: to let you sign in, show your posts and
            profile to other students, display accommodation listings, and let students contact
            listers about a room.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">3. How it's stored and protected</h2>
          <p>
            Your data is stored using Supabase, a database and authentication provider. Our
            database is hosted in Frankfurt, Germany. Access to your account data is restricted
            so that only you can edit or delete your own posts, listings, and profile.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">4. What's shared, and with whom</h2>
          <p>
            Your name, photo, posts, and any accommodation listings you create are visible to
            other Denverr users — that's how the platform works. If you list accommodation and
            add a WhatsApp number, that number is shown to students viewing that listing so they
            can contact you directly. Conversations that happen on WhatsApp are governed by
            WhatsApp's own privacy policy, not this one. We do not sell your information to
            advertisers or third parties.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">5. Staying logged in</h2>
          <p>
            Denverr uses your browser's local storage to keep you logged in between visits. This
            is purely functional — it is not used for tracking, advertising, or analytics, and we
            don't use tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">6. Your rights</h2>
          <p>Under South Africa's POPIA (Protection of Personal Information Act), you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
            <li>Know what personal information we hold about you</li>
            <li>Request a copy of it</li>
            <li>Ask us to correct inaccurate information</li>
            <li>Ask us to delete your account and personal information</li>
            <li>Object to how your information is processed</li>
            <li>Lodge a complaint with South Africa's Information Regulator</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at <span className="text-[#4F46E5] font-medium">[NTANDOM693@GMAL.COM]</span>.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">7. Complaints to the Information Regulator</h2>
          <p>
            If you're unhappy with how we've handled your information, you can also contact South
            Africa's Information Regulator directly:
          </p>
          <p className="mt-2">
            Email: enquiries@inforegulator.org.za<br />
            Complaints: POPIAComplaints@inforegulator.org.za<br />
            Address: Woodmead North Office Park, 54 Maxwell Drive, Woodmead, Johannesburg
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">8. Changes to this policy</h2>
          <p>
            As Denverr grows, this policy may be updated. We'll change the date at the top when
            that happens.
          </p>
        </section>

      </div>

    </main>
  );
}