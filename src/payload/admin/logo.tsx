"use client";

// DK LAO owns the workspace. BizEra's brandkit informs the interface, while DK LAO's logo leads.
import Image from "next/image";

import { useCmsLanguage } from "./login-controls";

export default function Logo() {
  const { language } = useCmsLanguage();
  return (
    <div className="bizera-brand bizera-brand--login">
      <div className="bizera-brand__logo">
        <Image src="/images/logo/Logo-H_Text.svg" alt="DK LAO" width={236} height={50} priority />
      </div>
      <h1 className="bizera-brand__heading" lang={language}>{language === "lo" ? "ຍົກ, ຂົນຍ້າຍ, ທຳຄວາມສະອາດ ແລະ ຊ່ວຍໃຫ້ທຸລະກິດຂອງທ່ານເຕີບໂຕ" : "Lifting, Moving, Cleaning & Growing Your Business"}</h1>
    </div>
  );
}
