import { Phone, Wrench } from "lucide-react";
import { siMessenger, siWhatsapp, type SimpleIcon } from "simple-icons";

import type { QuickContact } from "@/lib/data/mobile-app";

// Brand marks come from simple-icons (official glyphs, never hand-drawn), as on the website footer.
function BrandMark({ icon }: { icon: SimpleIcon }) {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

const look: Record<string, { color: string; mark: React.ReactNode }> = {
  call: { color: "var(--ios-green)", mark: <Phone className="size-6" fill="currentColor" strokeWidth={0} aria-hidden="true" /> },
  "whatsapp-sales": { color: "#25d366", mark: <BrandMark icon={siWhatsapp} /> },
  "whatsapp-service": { color: "#0061af", mark: <Wrench className="size-6" strokeWidth={2.2} aria-hidden="true" /> },
  messenger: { color: "#0866ff", mark: <BrandMark icon={siMessenger} /> },
};

// The same colour and mark as a 29pt rounded square, for contact rows in a list.
export function ContactRowIcon({ id }: { id: string }) {
  const { color, mark } = look[id] ?? look.call;

  return (
    <span className="grid size-[29px] shrink-0 place-items-center rounded-[7px] text-white android:size-10 android:rounded-full [&_svg]:size-[18px] android:[&_svg]:size-5" style={{ background: color }}>
      {mark}
    </span>
  );
}

// Round one-tap contact buttons, like the actions under a contact card in iOS Contacts.
export function QuickContacts({ contacts }: { contacts: QuickContact[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {contacts.map((contact) => {
        const { color, mark } = look[contact.id] ?? look.call;
        const external = contact.href.startsWith("http");

        return (
          <li key={contact.id}>
            <a
              href={contact.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={`${contact.label}, ${contact.detail}`}
              className="flex h-full flex-col items-center gap-1.5 rounded-[14px] bg-ios-cell px-1 py-3 text-center text-[11px] leading-[13px] font-medium text-ios-label no-underline active:bg-ios-fill android:rounded-[16px] android:bg-md-surface-low android:text-[12px] android:leading-4 android:tracking-[0.4px] android:text-md-on-surface android:active:bg-md-on-surface/10"
            >
              <span className="grid size-11 place-items-center rounded-full text-white" style={{ background: color }}>
                {mark}
              </span>
              {contact.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
