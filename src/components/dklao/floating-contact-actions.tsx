import Link from "next/link";
import { ClipboardList, MessageCircle } from "lucide-react";

import { quoteHref } from "@/lib/data/routes";

const actionClass =
  "grid size-[52px] place-items-center rounded-[18px] bg-action-red text-white shadow-cta transition-transform duration-150 ease-premium hover:-translate-y-0.5 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0";

// Quote and contact shortcuts that stay in view on wide screens. Hidden on phones, where the header
// menu and the in-page buttons are already within reach.
export function FloatingContactActions() {
  return (
    <div className="fixed right-5 bottom-5 z-50 grid gap-2.5 max-[780px]:hidden" aria-label="Quick contact actions">
      <Link href={quoteHref()} aria-label="Request a DK LAO quote" className={actionClass}>
        <ClipboardList size={20} aria-hidden="true" />
      </Link>
      <Link href="/contact" aria-label="Contact DK LAO advisor" className={actionClass}>
        <MessageCircle size={20} aria-hidden="true" />
      </Link>
    </div>
  );
}
