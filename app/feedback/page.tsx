"use client";

import { useState } from "react";
import { ArrowLeft, Lightbulb, Heart, CircleAlert, Bug, Check } from "lucide-react";

type FeedbackType = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const feedbackTypes: FeedbackType[] = [
  {
    id: "idea",
    label: "I have an idea",
    description: "Something Denverr could do better",
    icon: <Lightbulb size={22} strokeWidth={1.8} />,
  },
  {
    id: "like",
    label: "I like something",
    description: "Tell us what you want us to keep",
    icon: <Heart size={22} strokeWidth={1.8} />,
  },
  {
    id: "improve",
    label: "Something feels off",
    description: "Something could feel better",
    icon: <CircleAlert size={22} strokeWidth={1.8} />,
  },
  {
    id: "bug",
    label: "Something isn't working",
    description: "Tell us what went wrong",
    icon: <Bug size={22} strokeWidth={1.8} />,
  },
];

export default function FeedbackPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const selectedType = feedbackTypes.find(
    (type) => type.id === selected
  );

  function sendFeedback() {
    if (!selected || !message.trim()) return;
  
    const feedbackMessage = `Hey Denverr 👋
  
  FEEDBACK
  
  Type: ${selectedType?.label}
  
  ${message.trim()}
  
  — Sent from Denverr`;
  
    const whatsappUrl =
      `https://api.whatsapp.com/send?phone=27697858221&text=${encodeURIComponent(
        feedbackMessage
      )}`;
  
    window.open(whatsappUrl, "_blank");
  
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] px-5 pb-10">

      {/* Top bar */}
      <div className="pt-6 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EAF0] flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={19} strokeWidth={1.9} />
        </button>

        <p className="text-[13px] font-semibold tracking-wide text-[#737983]">
          FEEDBACK
        </p>

        <div className="w-10 h-10" />
      </div>

      {/* Intro */}
      <section className="mt-12">
        <div className="w-14 h-14 rounded-[18px] bg-[#111318] text-white flex items-center justify-center shadow-sm">
          <span className="text-[25px]">⭐</span>
        </div>

        <h1 className="text-[32px] leading-[1.05] font-bold tracking-[-0.045em] mt-6">
          Help shape
          <br />
          Denverr.
        </h1>

        <p className="text-[#737983] text-[15px] leading-6 mt-4 max-w-[330px]">
          Denverr is being built with students, not just for them.
          Tell us what you think.
        </p>
      </section>

      {/* Feedback choices */}
      <section className="mt-9">
        <p className="text-[12px] font-semibold text-[#8A8F98] tracking-wide uppercase mb-3">
          What do you want to tell us?
        </p>

        <div className="space-y-2">
          {feedbackTypes.map((type) => {
            const isSelected = selected === type.id;

            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelected(type.id);
                  setSent(false);
                }}
                className={`w-full text-left rounded-[20px] p-4 flex items-center gap-4 border transition-all duration-200 active:scale-[0.985] ${
                  isSelected
                    ? "bg-[#111318] border-[#111318] text-white shadow-lg"
                    : "bg-white border-[#E8EAF0] text-[#111318] hover:border-[#D7DAE0]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? "bg-white/10"
                      : "bg-[#F2F3F5]"
                  }`}
                >
                  {type.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px]">
                    {type.label}
                  </p>

                  <p
                    className={`text-[12px] mt-1 ${
                      isSelected
                        ? "text-white/60"
                        : "text-[#8A8F98]"
                    }`}
                  >
                    {type.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-white text-[#111318] flex items-center justify-center">
                    <Check size={15} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Message */}
      {selected && (
        <section className="mt-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-[12px] font-semibold text-[#8A8F98] tracking-wide uppercase mb-3">
            Your feedback
          </p>

          <div className="bg-white border border-[#E8EAF0] rounded-[22px] overflow-hidden focus-within:border-[#BFC4CC] transition">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selected === "idea"
                  ? "What should Denverr do?"
                  : selected === "like"
                  ? "What are you enjoying?"
                  : selected === "improve"
                  ? "What could feel better?"
                  : "What went wrong?"
              }
              rows={6}
              className="w-full resize-none bg-transparent px-5 py-5 text-[15px] leading-6 outline-none placeholder:text-[#A4A8AF]"
              autoFocus
            />

            <div className="px-5 pb-4 flex justify-between items-center">
              <span className="text-[11px] text-[#A4A8AF]">
                Your message will open in WhatsApp
              </span>

              <span className="text-[11px] text-[#A4A8AF]">
                {message.length}/500
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Send */}
      {selected && (
        <button
          onClick={sendFeedback}
          disabled={!message.trim() || sent}
          className={`w-full mt-5 rounded-[18px] py-4 font-semibold text-[15px] transition-all active:scale-[0.98] ${
            message.trim() && !sent
              ? "bg-[#111318] text-white shadow-lg"
              : "bg-[#E7E9ED] text-[#A0A5AD]"
          }`}
        >
          {sent ? "Opening WhatsApp..." : "Send via WhatsApp"}
        </button>
      )}

      {/* Small footer */}
      <p className="text-center text-[11px] text-[#A4A8AF] mt-7">
        No forms. No accounts. Just your feedback.
      </p>

    </main>
  );
}