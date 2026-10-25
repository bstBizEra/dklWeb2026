import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// DK LAO buttons. One primary (red-orange) per view; the others sit beside it.
const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-button border border-transparent px-[18px] py-3 text-[15px] font-extrabold leading-[1.1] transition-[transform,box-shadow,background-color,border-color] duration-150 ease-premium hover:-translate-y-px active:translate-y-px active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,var(--dk-color-action-red)_0%,var(--dk-color-action-orange)_58%,var(--dk-color-action-red-bright)_100%)] text-white shadow-cta",
        secondary: "border-white/30 bg-white/10 text-white hover:bg-white/15",
        light: "border-slate-300 bg-white text-navy-900 hover:border-navy-900/40",
        dark: "bg-navy-950 text-white",
        link: "min-h-0 border-0 px-0 py-0 text-brand-blue underline-offset-4 hover:translate-y-0 hover:underline",
      },
      size: {
        default: "",
        sm: "min-h-10 px-3.5 py-2 text-sm",
        lg: "min-h-14 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
