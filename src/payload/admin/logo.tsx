// DK LAO owns the workspace. BizEra's brandkit informs the interface, while DK LAO's logo leads.
import Image from "next/image";

export default function Logo() {
  return (
    <div className="bizera-brand bizera-brand--login">
      <Image src="/images/logo/Logo-H_Text.svg" alt="DK LAO" width={236} height={50} priority />
      <h1 className="bizera-brand__heading">Welcome to your workspace</h1>
      <p className="bizera-brand__description">Manage content, enquiries, and the details that keep DK LAO moving.</p>
      <p className="bizera-brand__line">
        <span>A DK LAO workspace developed by</span>{" "}
        <a href="https://www.bizera.la/" target="_blank" rel="noopener noreferrer">
          BizEra
        </a>
      </p>
    </div>
  );
}
