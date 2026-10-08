"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

import { answerSiteQuestion, type GuideAnswer } from "@/lib/site-guide";

type Message = { from: "guide" | "visitor"; text: string; answer?: GuideAnswer };

const firstMessage: Message = {
  from: "guide",
  text: "Hi, I'm DK Buddy. Ask about rental, forklifts, parts or maintenance, and I'll help you find the right next step.",
};
const suggestions = ["Rent a forklift", "Buy a forklift", "Book maintenance", "Find spare parts"];

function BuddyFace() {
  return <svg className="site-companion__face" viewBox="0 0 68 68" role="img" aria-label="Smiling forklift companion">
    <rect x="8" y="16" width="40" height="35" rx="10" fill="var(--dk-color-brand-blue)" />
    <rect x="13" y="20" width="30" height="24" rx="7" fill="var(--dk-color-neutral-white)" />
    <circle cx="23" cy="31" r="2.5" fill="var(--dk-color-navy-950)" />
    <circle cx="34" cy="31" r="2.5" fill="var(--dk-color-navy-950)" />
    <path d="M23 38q5 5 11 0" fill="none" stroke="var(--dk-color-navy-950)" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 18v34h12" fill="none" stroke="var(--dk-color-action-red)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="52" r="5" fill="var(--dk-color-navy-950)" />
    <circle cx="41" cy="52" r="5" fill="var(--dk-color-navy-950)" />
  </svg>;
}

export function SiteCompanion() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([firstMessage]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ block: "nearest" }); }, [messages, open]);

  if (pathname.startsWith("/staff")) return null;

  function ask(value: string) {
    const text = value.trim();
    if (!text) return;
    const answer = answerSiteQuestion(text);
    setMessages((previous) => [...previous.slice(-10), { from: "visitor", text }, { from: "guide", text: answer.text, answer }]);
    setQuestion("");
    inputRef.current?.focus();
  }

  function close() { setOpen(false); triggerRef.current?.focus(); }

  return <aside className="site-companion" aria-label="DK Buddy site guide">
    {open ? <section className="site-companion__panel" aria-label="Chat with DK Buddy" onKeyDown={(event) => { if (event.key === "Escape") close(); }}>
      <header className="site-companion__header">
        <BuddyFace />
        <div><strong>DK Buddy</strong><small>Instant site guide</small></div>
        <button type="button" aria-label="Close DK Buddy" onClick={close}><X size={20} aria-hidden="true" /></button>
      </header>
      <div className="site-companion__messages" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
        {messages.map((message, index) => <div className={`site-companion__message site-companion__message--${message.from}`} key={index}>
          <span className="site-companion__speaker">{message.from === "guide" ? "DK Buddy" : "You"}</span>
          <p>{message.text}</p>
          {message.answer?.href ? <Link href={message.answer.href} onClick={() => setOpen(false)}>{message.answer.label} →</Link> : null}
        </div>)}
        <div ref={endRef} />
      </div>
      {messages.length === 1 ? <div className="site-companion__suggestions">{suggestions.map((item) => <button type="button" key={item} onClick={() => ask(item)}>{item}</button>)}</div> : null}
      <form className="site-companion__form" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
        <label className="sr-only" htmlFor="buddy-question">Ask DK Buddy</label>
        <input ref={inputRef} id="buddy-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={300} placeholder="What do you need help with?" />
        <button type="submit" aria-label="Send question" disabled={!question.trim()}><Send size={18} aria-hidden="true" /></button>
      </form>
      <p className="site-companion__note">Site guidance only. DK LAO confirms prices, stock and technical details.</p>
    </section> : null}
    <button className="site-companion__trigger" type="button" ref={triggerRef} aria-expanded={open} aria-label={open ? "DK Buddy guide is open" : "Open DK Buddy guide"} onClick={() => setOpen(true)}>
      <BuddyFace /><span>Ask DK Buddy</span>
    </button>
  </aside>;
}
