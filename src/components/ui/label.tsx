"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root data-slot="label" className={cn("text-[0.9rem] leading-normal font-[850] text-navy-900", className)} {...props} />
  );
}

export { Label };
