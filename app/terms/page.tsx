import Link from "next/link";

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] text-[#14161F] px-6 py-8 max-w-2xl mx-auto">

      <Link href="/">
        <span className="text-[#6B7280] font-medium cursor-pointer">← Back</span>
      </Link>

      <h1 className="text-2xl font-bold mt-4">Terms of Use</h1>
      <p className="text-[#6B7280] text-sm mt-1">Last updated: September 2026</p>

      <div className="mt-6 flex flex-col gap-6 text-[#14161F] leading-relaxed">

        <p>
          By using Denverr, you agree to these terms. Please read them — they're written in plain
          language on purpose.
        </p>

        <section>
          <h2 className="font-semibold text-lg mb-1">1. What Denverr is</h2>
          <p>
            Denverr is a social platform built for university students, currently offering a
            social feed and an accommodation listing feature ("Stay") for finding and posting
            student housing.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">2. Your account</h2>
          <p>
            You're responsible for keeping your login details secure, and for anything posted from
            your account. Please provide accurate information when signing up.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">3. What's not allowed</h2>
          <p>You may not use Denverr to:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
            <li>Post hate speech, harassment, or threats toward others</li>
            <li>Impersonate another person</li>
            <li>Post fake, fraudulent, or misleading accommodation listings</li>
            <li>Share illegal content</li>
            <li>Spam other users</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">4. Accommodation listings</h2>
          <p>
            Denverr does not own, manage, inspect, or verify any accommodation listed on the
            platform. Arrangements to view or rent a room happen directly between you and the
            lister, usually via WhatsApp. Use good judgment: meet in safe places, verify details
            before paying anyone, and treat listings from people you don't know with the same
            caution you would anywhere else. Denverr is not responsible for the accuracy of a
            listing or the outcome of any arrangement made through it.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">5. Content you post</h2>
          <p>
            You own what you post. By posting on Denverr, you allow us to display it to other
            users as part of the normal running of the platform.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">6. Moderation</h2>
          <p>
            We may remove content or suspend accounts that break these terms, to keep Denverr safe
            and usable for everyone.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">7. No guarantees</h2>
          <p>
            Denverr is provided "as is." As a student-built platform, we can't guarantee it will
            always be available or error-free, and we're not liable for losses arising from your
            use of the platform, to the extent permitted by South African law.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">8. Ending your account</h2>
          <p>
            You can stop using Denverr at any time. Contact us if you'd like your account and data
            deleted.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">9. Governing law</h2>
          <p>These terms are governed by the laws of South Africa.</p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-1">10. Contact</h2>
          <p>
            Questions about these terms? Reach us at <span className="text-[#4F46E5] font-medium">[NTANDOM693@GMAIL.COM]</span>.
          </p>
        </section>

      </div>

    </main>
  );
}