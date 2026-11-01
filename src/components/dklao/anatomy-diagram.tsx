import Image from "next/image";

// alt: home.anatomy.imageAlt in the page's language.
export function AnatomyDiagram({ alt }: { alt: string }) {
  return (
    <figure className="m-0 w-full overflow-hidden rounded-card border border-slate-300/25 bg-navy-950 shadow-card max-[560px]:rounded-2xl">
      <Image
        className="block h-auto w-full"
        src="/images/anatomy/forklift-equipment-matching-reference.png"
        width={1672}
        height={941}
        sizes="(max-width: 1024px) 100vw, 58vw"
        alt={alt}
      />
    </figure>
  );
}
