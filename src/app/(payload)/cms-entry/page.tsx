import type { Metadata } from "next";

import EntranceForm from "./entrance-form";
import "./entrance.css";

export const metadata: Metadata = {
  title: "CMS entrance | DK LAO",
  description: "Secure entrance to the DK LAO content management system.",
  robots: { index: false, follow: false },
};

export default function Page() { return <EntranceForm />; }
