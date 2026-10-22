// Owner-confirmed business facts. A null value means "not confirmed yet".
// Any page item bound to a null fact is hidden, so nothing unverified is published.
// Fill a value here (and nowhere else) once the owner has confirmed it.
export type FactKey =
  | "phone"
  | "whatsapp"
  | "email"
  | "address"
  | "hours"
  | "serviceAreas"
  | "quoteReplyTime"
  | "deliveryCoverage"
  | "maintenanceTerms"
  | "rentToBuyTerms";

export type SiteFacts = Record<FactKey, string | null>;

export const siteFacts: SiteFacts = {
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  hours: null,
  serviceAreas: null,
  quoteReplyTime: null,
  deliveryCoverage: null,
  maintenanceTerms: null,
  rentToBuyTerms: null,
};
