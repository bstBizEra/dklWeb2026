import Image from "next/image";

import { getSiteFacts } from "@/lib/cms/site-facts";
import { clientLogo, parseClientGroups } from "@/lib/data/clients";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/section";

// Key account customers named by the owner, grouped by sector. A client with a logo (clientLogos) shows its
// logo on a white tile, named in the alt text; any other client shows as a text pill. Nothing shows until
// the fact is filled in. Groups sit in two columns on wide screens and stack below 1100px; tiles wrap and
// get smaller on phones.
export async function TrustedBy({ title = "Trusted by businesses and public bodies in Laos" }: { title?: string } = {}) {
  const groups = parseClientGroups((await getSiteFacts()).referenceClients);

  if (groups.length === 0) return null;

  return (
    <section className="border-b border-slate-100 bg-white py-11 max-[780px]:py-8" aria-labelledby="trusted-by-title">
      <Container>
        <h2
          id="trusted-by-title"
          className="trusted-by__title mt-0 mb-6 text-[clamp(1.35rem,2.2vw,1.7rem)] font-[850] tracking-[-0.02em] text-navy-950 max-[780px]:mb-[18px]"
        >
          {title}
        </h2>
        <div className="trusted-by__groups grid grid-cols-2 gap-x-12 gap-y-7 max-[1100px]:grid-cols-1 max-[780px]:gap-[18px]">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mt-0 mb-3 text-[13px] font-[850] tracking-[0.08em] text-slate-500 uppercase">{group.title}</h3>
              <ul className="m-0 flex list-none flex-wrap items-center gap-3 p-0 max-[780px]:gap-2">
                {group.names.map((name) => {
                  const logo = clientLogo(name);

                  return (
                    <li key={name}>
                      {logo ? (
                        <span className="flex h-[72px] w-[144px] items-center justify-center rounded-card border border-slate-200 bg-white p-2 max-[780px]:h-14 max-[780px]:w-[104px]">
                          <Image src={logo} alt={name} width={500} height={250} className="h-full w-full object-contain" />
                        </span>
                      ) : (
                        <Badge className="border-slate-300 font-extrabold max-[780px]:px-3.5 max-[780px]:py-1.5 max-[780px]:text-[0.92rem]">
                          {name}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
