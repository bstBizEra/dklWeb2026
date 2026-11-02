"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { contactMethods } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { powerPreferences, rentalInquirySchemaFor, rentalPeriods, type RentalInquiryInput } from "@/lib/validation/rental";
import { environments } from "@/lib/validation/sales";
import { en, type Messages } from "@/messages/en";

type RentalResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (RentalInquiryForm), rebuilt on the quote form's parts: same
// honeypot, field errors, offline message and reference number.
const emptyValues = (): RentalInquiryInput => ({
  rentalPeriod: "SHORT_TERM",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  location: "",
  capacity: "",
  liftHeight: "",
  environment: "INDOOR",
  powerPreference: "",
  startDate: "",
  duration: "",
  workingHours: "",
  requirementDetail: "",
  sourcePage: "/forklift-rental",
  homepageUrl: "",
});

type RentalInquiryFormProps = {
  // getMessages(locale).rentalForm, .salesForm (working area), .serviceForm ("Choose"), .contactForm
  // (contact methods) and .quoteForm (shared texts).
  labels?: Messages["rentalForm"];
  sales?: Messages["salesForm"];
  service?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
};

export function RentalInquiryForm({
  labels: t = en.rentalForm,
  sales: f = en.salesForm,
  service: s = en.serviceForm,
  contact: c = en.contactForm,
  shared: q = en.quoteForm,
}: RentalInquiryFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schema] = useState(() => rentalInquirySchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RentalInquiryInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const detailLength = useWatch({ control, name: "requirementDetail" })?.length ?? 0;

  async function onSubmit(values: RentalInquiryInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: RentalResponse;
    try {
      const response = await fetch("/api/leads/rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, sourcePage: window.location.pathname || "/forklift-rental" }),
      });
      result = (await response.json()) as RentalResponse;
    } catch {
      setErrorMessage(navigator.onLine === false ? q.offline : q.sendFailed);
      return;
    }

    if (!result.ok) {
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string }[]) {
        const field = detail.path?.[0];
        if (typeof field === "string" && field in values && field !== "sourcePage") {
          setError(field as keyof RentalInquiryInput, { message: detail.message }, { shouldFocus: !placed });
          placed = true;
        }
      }
      setErrorMessage(placed ? q.checkFields : (q.serverErrors[result.error.code] ?? result.error.message));
      return;
    }

    setSuccessMessage(`${q.received || result.message} ${q.reference} ${result.data.leadId}.`);
    reset(emptyValues());
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }
    return handleSubmit(onSubmit)(event);
  };

  return (
    <Card className="quote-form relative p-[30px] max-[780px]:p-[22px]">
      <form onSubmit={submit} id="rental-inquiry" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="rt-homepageUrl">
            {q.trap}
            <input id="rt-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="rt-rentalPeriod" label={t.rentalPeriod} error={errors.rentalPeriod}>
            <NativeSelect id="rt-rentalPeriod" {...describedBy("rt-rentalPeriod", errors.rentalPeriod)} {...register("rentalPeriod")}>
              {rentalPeriods.map((period) => (
                <option key={period} value={period}>
                  {t.periods[period]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="rt-environment" label={f.environment} error={errors.environment}>
            <NativeSelect id="rt-environment" {...describedBy("rt-environment", errors.environment)} {...register("environment")}>
              {environments.map((environment) => (
                <option key={environment} value={environment}>
                  {f.environments[environment]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="rt-capacity" label={t.capacity} error={errors.capacity}>
            <p id="rt-capacity-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.capacityHint}
            </p>
            <Input
              id="rt-capacity"
              maxLength={40}
              {...describedBy("rt-capacity", errors.capacity)}
              aria-describedby={["rt-capacity-hint", errors.capacity ? "rt-capacity-error" : ""].filter(Boolean).join(" ")}
              {...register("capacity")}
            />
          </Field>
          <Field id="rt-liftHeight" label={t.liftHeight} error={errors.liftHeight}>
            <p id="rt-liftHeight-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.liftHeightHint}
            </p>
            <Input
              id="rt-liftHeight"
              maxLength={40}
              {...describedBy("rt-liftHeight", errors.liftHeight)}
              aria-describedby={["rt-liftHeight-hint", errors.liftHeight ? "rt-liftHeight-error" : ""].filter(Boolean).join(" ")}
              {...register("liftHeight")}
            />
          </Field>
          <Field id="rt-location" label={t.location} error={errors.location}>
            <Input id="rt-location" maxLength={120} {...describedBy("rt-location", errors.location)} {...register("location")} />
          </Field>
          <Field id="rt-powerPreference" label={t.powerPreference} optional={q.optional}>
            <NativeSelect id="rt-powerPreference" {...describedBy("rt-powerPreference", undefined, false)} {...register("powerPreference")}>
              <option value="">{s.choose}</option>
              {powerPreferences.map((power) => (
                <option key={power} value={power}>
                  {t.powerPreferences[power]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="rt-startDate" label={t.startDate} error={errors.startDate} optional={q.optional}>
            <Input id="rt-startDate" maxLength={40} {...describedBy("rt-startDate", errors.startDate, false)} {...register("startDate")} />
          </Field>
          <Field id="rt-duration" label={t.duration} error={errors.duration} optional={q.optional}>
            <Input id="rt-duration" maxLength={40} {...describedBy("rt-duration", errors.duration, false)} {...register("duration")} />
          </Field>
          <Field id="rt-workingHours" label={t.workingHours} error={errors.workingHours} optional={q.optional} wide>
            <Input id="rt-workingHours" maxLength={40} {...describedBy("rt-workingHours", errors.workingHours, false)} {...register("workingHours")} />
          </Field>
          <Field id="rt-requirementDetail" label={t.requirementDetail} error={errors.requirementDetail} wide>
            <p id="rt-requirementDetail-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.requirementHint}
            </p>
            <Textarea
              id="rt-requirementDetail"
              rows={4}
              maxLength={500}
              {...describedBy("rt-requirementDetail", errors.requirementDetail)}
              aria-describedby={["rt-requirementDetail-hint", "rt-requirementDetail-count", errors.requirementDetail ? "rt-requirementDetail-error" : ""]
                .filter(Boolean)
                .join(" ")}
              {...register("requirementDetail")}
            />
            <small id="rt-requirementDetail-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {detailLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="rt-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="rt-companyName" autoComplete="organization" {...describedBy("rt-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="rt-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="rt-contactPerson" autoComplete="name" {...describedBy("rt-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="rt-phone" label={q.phone} error={errors.phone}>
            <Input id="rt-phone" type="tel" autoComplete="tel" {...describedBy("rt-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="rt-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="rt-email" type="email" autoComplete="email" {...describedBy("rt-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="rt-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect id="rt-preferredContactMethod" {...describedBy("rt-preferredContactMethod", errors.preferredContactMethod)} {...register("preferredContactMethod")}>
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {c.methods[method]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

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
          {isSubmitting ? q.sending : t.submit}
          <Send size={18} aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
