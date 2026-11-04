// The login screen's mark. DK LAO owns what is inside the CMS, so its logo leads; BizEra built the
// panel, so the credit below it carries BizEra's mint. Both marks are real files — bizera.la publishes
// no logo, so their identity arrives as colour, type and the wordmark their own site sets in text.
import Image from "next/image";

export default function Logo() {
  return (
    <div className="bizera-brand bizera-brand--login">
      <Image src="/images/logo/Logo-H_Text.svg" alt="DK LAO" width={236} height={50} priority />
      <h1 className="bizera-brand__heading">Welcome to your workspace</h1>
      <p className="bizera-brand__description">Manage content, enquiries, and the details that keep DK LAO moving.</p>
      <p className="bizera-brand__line">
        A DK LAO workspace by{" "}
        <a href="https://www.bizera.la/" target="_blank" rel="noopener noreferrer">
          BizEra
        </a>
      </p>
    </div>
  );
}
