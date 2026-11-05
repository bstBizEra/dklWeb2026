"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import LoginControls, { useCmsLanguage } from "@/payload/admin/login-controls";

const copy = {
  en: { slogan: "Lifting, Moving, Cleaning & Growing Your Business", welcome: "Welcome to the DK LAO CMS", introduction: "Verify your email before signing in to manage your content.", getKey: "Get your entrance key", enterKey: "Enter your entrance key", emailHelp: "Use the email address of your existing CMS account.", codeHelp: "Enter the six-digit key sent to your email. It is valid for 10 minutes.", email: "Email address", code: "Six-digit key", wait: "Please wait…", send: "Send entrance key", continue: "Continue to password", resend: "Request new key", change: "Change email", sent: "If this is a CMS account, an entrance key has been sent.", failed: "The connection failed. Please try again.", tryAgain: "Please try again.", invalid: "Invalid or expired key", unavailable: "Entrance key is temporarily unavailable" },
  lo: { slogan: "ຍົກ, ຂົນຍ້າຍ, ທຳຄວາມສະອາດ ແລະ ຊ່ວຍໃຫ້ທຸລະກິດຂອງທ່ານເຕີບໂຕ", welcome: "ຍິນດີຕ້ອນຮັບສູ່ DK LAO CMS", introduction: "ຢືນຢັນອີເມວກ່ອນເຂົ້າລະບົບເພື່ອຈັດການເນື້ອຫາ.", getKey: "ຮັບລະຫັດເຂົ້າລະບົບ", enterKey: "ໃສ່ລະຫັດເຂົ້າລະບົບ", emailHelp: "ໃຊ້ອີເມວຂອງບັນຊີ CMS ທີ່ມີຢູ່.", codeHelp: "ໃສ່ລະຫັດ 6 ຕົວເລກທີ່ສົ່ງໄປຫາອີເມວ. ລະຫັດມີອາຍຸ 10 ນາທີ.", email: "ອີເມວ", code: "ລະຫັດ 6 ຕົວເລກ", wait: "ກະລຸນາລໍຖ້າ…", send: "ສົ່ງລະຫັດເຂົ້າລະບົບ", continue: "ຕໍ່ໄປຫາລະຫັດຜ່ານ", resend: "ຂໍລະຫັດໃໝ່", change: "ປ່ຽນອີເມວ", sent: "ຖ້ານີ້ແມ່ນບັນຊີ CMS, ລະຫັດໄດ້ຖືກສົ່ງແລ້ວ.", failed: "ການເຊື່ອມຕໍ່ລົ້ມເຫຼວ. ກະລຸນາລອງອີກຄັ້ງ.", tryAgain: "ກະລຸນາລອງອີກຄັ້ງ.", invalid: "ລະຫັດບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ", unavailable: "ລະຫັດເຂົ້າລະບົບບໍ່ພ້ອມໃຊ້ຊົ່ວຄາວ" },
} as const;

export default function EntranceForm() {
  const { language, changeLanguage } = useCmsLanguage();
  const t = copy[language];
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [message, setMessage] = useState<{ en: string; lo: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendKey() {
    const response = await fetch("/api/cms-entry/request", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
    });
    const result = await response.json() as { message?: string; error?: string };
    if (!response.ok) { setMessage({ en: result.error ?? copy.en.tryAgain, lo: copy.lo.unavailable }); return; }
    setStep("code"); setCode(""); setMessage({ en: copy.en.sent, lo: copy.lo.sent });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(null);
    try {
      if (step === "email") { await sendKey(); return; }
      const response = await fetch("/api/cms-entry/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json() as { message?: string; error?: string; next?: string };
      if (!response.ok) { setMessage({ en: result.error ?? copy.en.tryAgain, lo: response.status === 401 ? copy.lo.invalid : copy.lo.unavailable }); return; }
      window.location.assign(result.next ?? "/admin/login");
    } catch { setMessage({ en: copy.en.failed, lo: copy.lo.failed }); }
    finally { setBusy(false); }
  }

  async function resend() {
    setBusy(true); setMessage(null);
    try { await sendKey(); }
    catch { setMessage({ en: copy.en.failed, lo: copy.lo.failed }); }
    finally { setBusy(false); }
  }

  return <main className="cms-entrance" lang={language}>
    <section className="cms-entrance__shell" aria-label="DK LAO CMS entrance">
      <div className="cms-entrance__visual">
        <span className="cms-entrance__logo"><Image src="/images/logo/Logo-H_Text.svg" alt="DK LAO" width={236} height={50} priority /></span>
        <p className="cms-entrance__slogan" lang={language}>{t.slogan}</p>
      </div>
      <div className="cms-entrance__content">
        <LoginControls language={language} onLanguageChange={changeLanguage} />
        <div className="cms-entrance__intro"><h1>{t.welcome}</h1><p>{t.introduction}</p></div>
        <form onSubmit={submit}>
          <h2>{step === "email" ? t.getKey : t.enterKey}</h2>
          <p>{step === "email" ? t.emailHelp : t.codeHelp}</p>
          <label htmlFor="entry-email">{t.email}</label>
          <input id="entry-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} readOnly={step === "code"} tabIndex={step === "code" ? -1 : undefined} />
          {step === "code" && <><label htmlFor="entry-code">{t.code}</label><div className="cms-entrance__code-field"><input id="entry-code" type="text" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /><button type="button" disabled={busy} onClick={resend}>{t.resend}</button></div></>}
          <p className="cms-entrance__message" role="status" aria-live="polite">{message?.[language] ?? ""}</p>
          <button type="submit" disabled={busy}>{busy ? t.wait : step === "email" ? t.send : t.continue}</button>
          {step === "code" && <div className="cms-entrance__links"><button type="button" onClick={() => { setStep("email"); setCode(""); setMessage(null); }}>{t.change}</button></div>}
        </form>
      </div>
    </section>
  </main>;
}
