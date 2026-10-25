import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

// White surface with the DK LAO card radius, hairline border and soft shadow.
function Card({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="card"
      className={cn("rounded-card border border-border bg-card text-card-foreground shadow-card", className)}
      {...props}
    />
  );
}

export { Card };
