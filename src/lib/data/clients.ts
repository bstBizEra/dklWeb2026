export type ClientGroup = { title: string; names: string[] };

// Customer logos in public/images/clients, supplied by the owner from DK LAO's "Key Account Customers"
// artwork (25 October 2026), who confirmed DK LAO may show them. A client without a logo here is shown
// as a text pill.
export const clientLogos: Record<string, string> = {
  Beerlao: "beerlao",
  "Coca-Cola": "coca-cola",
  Heineken: "heineken",
  Pepsi: "pepsi",
  "Tiger Beer": "tiger-beer",
  DHL: "dhl",
  "Lao Freight Forwarder": "lao-freight-forwarder",
  NTPC: "ntpc",
  PTT: "ptt",
  "Savan Logistics": "savan-logistics",
  MMG: "mmg",
  "Phu Bia Mining": "phu-bia-mining",
  KCL: "kcl",
  "5N Plus": "5n-plus",
  "Lao Telecom": "lao-telecom",
  "Lao Tobacco": "lao-tobacco",
  "Lao World": "lao-world",
  CPF: "cpf",
  "Phonesack Group": "phonesack-group",
  // Sent by the owner in chat on 25 October 2026; the square emblem sits centred on a 2:1 white canvas.
  "Ministry of Public Health": "ministry-of-public-health",
  // Owner-supplied link (cdn.108.jobs company image), 25 October 2026; white border trimmed.
  HOYA: "hoya",
};

export const clientLogo = (name: string) => (clientLogos[name] ? `/images/clients/${clientLogos[name]}.webp` : undefined);

// The "referenceClients" fact lists groups separated by "|", each as "Group title: Name, Name, Name".
// Example: "Forklift rental and fleet: Beerlao, Coca-Cola | Government: Ministry of Public Health".
// A group with no title or no names is dropped, and a name appears once.
export function parseClientGroups(value: string | null | undefined): ClientGroup[] {
  const groups: ClientGroup[] = [];

  for (const part of (value ?? "").split("|")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;

    const title = part.slice(0, colon).trim();
    const seen = new Set<string>();
    const names = part
      .slice(colon + 1)
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name && !seen.has(name.toLowerCase()) && seen.add(name.toLowerCase()));

    if (title && names.length > 0) groups.push({ title, names });
  }

  return groups;
}
