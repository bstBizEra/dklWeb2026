"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

// Any react-hook-form error with a message (plain fields and merged ones alike).
type FieldError = { message?: string };

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eyebrow } from "@/components/ui/section";
import { categoryOptions, leadTypeForCategory } from "@/lib/leads/intents";
import { cn } from "@/lib/utils";
import {
  quoteRequestSchema,
  type ApiError,
  type ApiSuccess,
  type QuoteRequestInput,
} from "@/lib/validation/leads";

type QuoteResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

type QuoteRequestFormProps = {
  defaultCategory?: string;
  // Page the visitor came from. Falls back to the current path.
  sourcePage?: string;
  showHeader?: boolean;
};

function emptyValues(category: string): QuoteRequestInput {
  return {
    leadType: leadTypeForCategory(category),
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    equipmentOrServiceCategory: category,
    message: "",
    sourcePage: "/",
    homepageUrl: "",
  };
}

// One labelled field. The error message is linked to the control (aria-describedby), the control is
// marked invalid, and the message is announced as soon as it appears.
function Field({
  id,
  label,
  error,
  wide = false,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: FieldError;
  wide?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", wide && "col-span-full")}>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="font-semibold text-slate-500"> (optional)</span> : null}
      </Label>
      {children}
      {error ? (
        <small id={`${id}-error`} role="alert" className="text-[13px] font-[750] text-destructive">
          {error.message}
        </small>
      ) : null}
    </div>
  );
}

// Props that tie a control to its error message. Required fields say so up front, not only after a failed send.
const describedBy = (id: string, error?: FieldError, required = true) => ({
  "aria-required": required || undefined,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

export function QuoteRequestForm({
  defaultCategory = categoryOptions[0],
  sourcePage,
  showHeader = true,
}: QuoteRequestFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: emptyValues(defaultCategory),
    // Check a field when the visitor leaves it, then live while they correct it.
    mode: "onTouched",
  });
  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;

  async function onSubmit(values: QuoteRequestInput) {
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      ...values,
      leadType: leadTypeForCategory(values.equipmentOrServiceCategory),
      sourcePage: sourcePage ?? (window.location.pathname || "/"),
    };

    let result: QuoteResponse;
    try {
      const response = await fetch("/api/leads/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      result = (await response.json()) as QuoteResponse;
    } catch {
      // Offline, or the server answered with something other than our JSON. The typed details stay in place.
      setErrorMessage(
        navigator.onLine === false
          ? "You are offline. Your details are still here: send again when you are back online, or call or WhatsApp DK LAO."
          : "Your request could not be sent. Please try again, or call or WhatsApp DK LAO.",
      );
      return;
    }

    if (!result.ok) {
      // Field problems found by the server are shown on the fields themselves, like the ones checked here.
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string }[]) {
        const field = detail.path?.[0];
        if (typeof field === "string" && field in payload && field !== "leadType" && field !== "sourcePage") {
          setError(field as keyof QuoteRequestInput, { message: detail.message }, { shouldFocus: !placed });
          placed = true;
        }
      }
      setErrorMessage(placed ? "Please check the highlighted fields." : result.error.message);
      return;
    }

    setSuccessMessage(`${result.message} Your reference: ${result.data.leadId}.`);
    reset(emptyValues(defaultCategory));
  }

  // A second send is ignored while one is in flight. The button stays focusable (aria-disabled, not
  // disabled) so a keyboard user keeps their place and hears the result.
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    return handleSubmit(onSubmit)(event);
  };

  return (
    <Card className="quote-form relative p-[30px] max-[780px]:p-[22px]">
      <form onSubmit={submit} id="quote-request" className="scroll-mt-[110px]" noValidate>
        {showHeader ? (
          <div className="mb-6 grid gap-3">
            <Eyebrow>Central quote request</Eyebrow>
            <h2 className="m-0 text-[2.5rem] font-[850] leading-[1.06] tracking-[-0.03em] text-navy-950 max-[780px]:text-[2rem]">
              Tell DK LAO what your operation needs
            </h2>
            <p className="m-0 leading-[1.75] text-slate-700">
              Share the equipment or service category, site context, and contact details
              so the right advisor can review your request.
            </p>
          </div>
        ) : null}

        <input type="hidden" value="QUOTE_REQUEST" {...register("leadType")} />
        <input type="hidden" value="/" {...register("sourcePage")} />

        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="homepageUrl">
            Leave this field empty
            <input id="homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="companyName" label="Company or organisation" error={errors.companyName}>
            <Input id="companyName" autoComplete="organization" {...describedBy("companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="contactPerson" label="Contact person" error={errors.contactPerson}>
            <Input id="contactPerson" autoComplete="name" {...describedBy("contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone}>
            <Input id="phone" type="tel" autoComplete="tel" {...describedBy("phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="email" label="Email" error={errors.email} optional>
            <Input id="email" type="email" autoComplete="email" {...describedBy("email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="equipmentOrServiceCategory" label="Equipment or service category" error={errors.equipmentOrServiceCategory} wide>
            <NativeSelect
              id="equipmentOrServiceCategory"
              {...describedBy("equipmentOrServiceCategory", errors.equipmentOrServiceCategory, false)}
              {...register("equipmentOrServiceCategory")}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="message" label="Requirement details" error={errors.message} wide>
            <p id="message-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              Load, lift height, site and timing, for example: 2.5 t forklift, 4.5 m lift, 3 months, warehouse in Vientiane.
            </p>
            <Textarea
              id="message"
              rows={5}
              maxLength={1200}
              {...describedBy("message", errors.message)}
              aria-describedby={["message-hint", "message-count", errors.message ? "message-error" : ""].filter(Boolean).join(" ")}
              {...register("message")}
            />
            <small id="message-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {messageLength.toLocaleString("en-US")} / 1,200
            </small>
          </Field>
        </div>

        {/* Result of sending, announced politely to screen readers. */}
        <div aria-live="polite">
          {successMessage ? (
            <p className="mt-4 mb-0 flex items-center gap-2.5 rounded-button bg-green-600/10 px-3.5 py-3 font-[750] text-green-800">
              <CheckCircle2 size={18} aria-hidden="true" />
              {successMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 mb-0 flex items-center gap-2.5 rounded-button bg-destructive/10 px-3.5 py-3 font-[750] text-red-800">
              <AlertCircle size={18} aria-hidden="true" />
              {errorMessage}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="mt-[18px] w-full aria-disabled:cursor-progress aria-disabled:opacity-60"
          aria-disabled={isSubmitting || undefined}
        >
          {isSubmitting ? "Sending Request" : "Request a Quote"}
          <Send size={18} aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
