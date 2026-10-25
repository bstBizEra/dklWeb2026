import * as React from "react";

import { cn } from "@/lib/utils";

// Shared field look for inputs, selects and text areas. aria-invalid turns the border red.
export const fieldClass =
  "w-full min-h-12 rounded-[14px] border border-input bg-white px-3.5 py-[13px] text-base text-navy-950 transition-colors placeholder:text-slate-500 focus-visible:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-blue/40 aria-invalid:border-destructive aria-invalid:outline-destructive/40 disabled:opacity-60";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldClass, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldClass, "min-h-32 resize-y", className)} {...props} />;
}

// A styled native select: phones show their own picker and screen readers read it without extra work.
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="native-select" className={cn(fieldClass, "cursor-pointer", className)} {...props} />;
}

export { Input, Textarea, NativeSelect };
