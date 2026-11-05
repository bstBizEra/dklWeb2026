"use client";

import { useEffect } from "react";

import LoginControls, { useCmsLanguage } from "./login-controls";

// Payload's minimal login template uses a div for its content wrapper. Give the
// whole sign-in flow a main landmark after hydration without replacing its form.
export default function LoginLandmark() {
  const { language, changeLanguage } = useCmsLanguage();
  useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(".template-minimal__wrap:has(.login__form)");
    wrapper?.setAttribute("role", "main");
    wrapper?.setAttribute("aria-label", "DK LAO CMS sign in");

    return () => {
      wrapper?.removeAttribute("role");
      wrapper?.removeAttribute("aria-label");
    };
  }, []);

  return (
    <div className="bizera-login-intro" lang={language}>
      <LoginControls language={language} onLanguageChange={changeLanguage} />
      <h2>{language === "lo" ? "ຍິນດີຕ້ອນຮັບສູ່ພື້ນທີ່ເຮັດວຽກ" : "Welcome to your workspace"}</h2>
      <p>{language === "lo" ? "ຈັດການເນື້ອຫາ, ຄຳຖາມ ແລະ ລາຍລະອຽດທີ່ຊ່ວຍໃຫ້ DK LAO ກ້າວໄປຂ້າງໜ້າ." : "Manage content, enquiries, and the details that keep DK LAO moving."}</p>
      <p className="bizera-login-intro__credit">
        A DK LAO workspace developed by{" "}
        <a href="https://www.bizera.la/" target="_blank" rel="noopener noreferrer">
          BizEra
        </a>
      </p>
    </div>
  );
}
