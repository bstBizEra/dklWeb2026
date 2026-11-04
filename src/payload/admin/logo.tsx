// DK LAO owns the workspace. BizEra's brandkit informs the interface, while DK LAO's logo leads.
import Image from "next/image";

export default function Logo() {
  return (
    <div className="bizera-brand bizera-brand--login">
      <div className="bizera-brand__logo">
        <Image src="/images/logo/Logo-H_Text.svg" alt="DK LAO" width={236} height={50} priority />
      </div>
      <h1 className="bizera-brand__heading">Lifting, Moving, Cleaning &amp; Growing Your Business</h1>
    </div>
  );
}
