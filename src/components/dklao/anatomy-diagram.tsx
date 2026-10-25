import Image from "next/image";

export function AnatomyDiagram() {
  return (
    <figure className="m-0 w-full overflow-hidden rounded-card border border-slate-300/25 bg-navy-950 shadow-card max-[560px]:rounded-2xl">
      <Image
        className="block h-auto w-full"
        src="/images/anatomy/forklift-equipment-matching-reference.png"
        width={1672}
        height={941}
        sizes="(max-width: 1024px) 100vw, 58vw"
        alt="DK LAO forklift anatomy reference showing labeled parts including mast, lift chains, tilt cylinder, load backrest, carriage, forks, safety beacon, overhead guard, operator seat, steering wheel, control levers, hydraulic hoses, engine compartment, counterweight, fuel tank or battery compartment, service access panel, rear steering wheels, front drive wheels, and hydraulic cylinders."
      />
    </figure>
  );
}
