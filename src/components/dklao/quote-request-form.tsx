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
import { categoryOptions, leadIntents, leadTypeForCategory } from "@/lib/leads/intents";
import { cn } from "@/lib/utils";
import {
  quoteRequestSchemaFor,
  type ApiError,
  type ApiSuccess,
  type QuoteRequestInput,
} from "@/lib/validation/leads";
import { en, type Messages } from "@/messages/en";

type QuoteResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;
type Labels = Messages["quoteForm"];

// The English category each list entry sends (the CRM's value), mapped to its key in labels.categories.
const categoryKey = Object.fromEntries(Object.entries(leadIntents).map(([key, intent]) => [intent.category, key])) as Record<
  string,
  keyof Labels["categories"]
>;

type QuoteRequestFormProps = {
  defaultCategory?: string;
  // Page the visitor came from. Falls back to the current path.
  sourcePage?: string;
  showHeader?: boolean;
  // The page's language: getMessages(locale).quoteForm, passed from the server page.
  labels?: Labels;
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
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: FieldError;
  wide?: boolean;
  // The "(optional)" text in the page's language, for a field that may be left empty.
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", wide && "col-span-full")}>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="font-semibold text-slate-500"> {optional}</span> : null}
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
  labels: t = en.quoteForm,
}: QuoteRequestFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schema] = useState(() => quoteRequestSchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(schema),
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
      setErrorMessage(navigator.onLine === false ? t.offline : t.sendFailed);
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
      setErrorMessage(placed ? t.checkFields : (t.serverErrors[result.error.code] ?? result.error.message));
      return;
    }

    // English shows the server's own thank-you (t.received is empty); Lao has its own.
    setSuccessMessage(`${t.received || result.message} ${t.reference} ${result.data.leadId}.`);
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
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="m-0 text-[2.5rem] font-[850] leading-[1.06] tracking-[-0.03em] text-navy-950 max-[780px]:text-[2rem]">
              {t.title}
            </h2>
            <p className="m-0 leading-[1.75] text-slate-700">{t.copy}</p>
          </div>
        ) : null}

        <input type="hidden" value="QUOTE_REQUEST" {...register("leadType")} />
        <input type="hidden" value="/" {...register("sourcePage")} />

        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="homepageUrl">
            {t.trap}
            <input id="homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="companyName" label={t.companyName} error={errors.companyName}>
            <Input id="companyName" autoComplete="organization" {...describedBy("companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="contactPerson" label={t.contactPerson} error={errors.contactPerson}>
            <Input id="contactPerson" autoComplete="name" {...describedBy("contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="phone" label={t.phone} error={errors.phone}>
            <Input id="phone" type="tel" autoComplete="tel" {...describedBy("phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="email" label={t.email} error={errors.email} optional={t.optional}>
            <Input id="email" type="email" autoComplete="email" {...describedBy("email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="equipmentOrServiceCategory" label={t.category} error={errors.equipmentOrServiceCategory} wide>
            <NativeSelect
              id="equipmentOrServiceCategory"
              {...describedBy("equipmentOrServiceCategory", errors.equipmentOrServiceCategory, false)}
              {...register("equipmentOrServiceCategory")}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {t.categories[categoryKey[option]] ?? option}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="message" label={t.message} error={errors.message} wide>
            <p id="message-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.messageHint}
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
          {isSubmitting ? t.sending : t.submit}
          <Send size={18} aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
