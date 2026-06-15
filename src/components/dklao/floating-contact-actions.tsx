import Link from "next/link";
import { ClipboardList, MessageCircle } from "lucide-react";

export function FloatingContactActions() {
  return (
    <div className="floating-actions" aria-label="Quick contact actions">
      <Link href="#quote-request" aria-label="Request a DK LAO quote">
        <ClipboardList size={20} aria-hidden="true" />
      </Link>
      <Link href="/contact" aria-label="Contact DK LAO advisor">
        <MessageCircle size={20} aria-hidden="true" />
      </Link>
    </div>
  );
}
