"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { environments, salesConditions, salesInquirySchemaFor, type SalesInquiryInput } from "@/lib/validation/sales";
import { en, type Messages } from "@/messages/en";

type SalesResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (ForkliftInquiryForm), rebuilt on the quote form's parts: same
// honeypot, field errors, offline message and reference number.
const emptyValues = (): SalesInquiryInput => ({
  condition: "NEW",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  location: "",
  capacity: "",
  liftHeight: "",
  environment: "INDOOR",
  application: "",
  preferredBrand: "",
  timeline: "",
  budgetRange: "",
  requirementDetail: "",
  sourcePage: "/forklift-sales",
  homepageUrl: "",
});

type SalesInquiryFormProps = {
  // getMessages(locale).salesForm, .serviceForm ("Choose"), .contactForm (contact methods and timelines)
  // and .quoteForm (shared texts).
  labels?: Messages["salesForm"];
  service?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
};

export function SalesInquiryForm({
  labels: t = en.salesForm,
  service: s = en.serviceForm,
  contact: c = en.contactForm,
  shared: q = en.quoteForm,
}: SalesInquiryFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schema] = useState(() => salesInquirySchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SalesInquiryInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const detailLength = useWatch({ control, name: "requirementDetail" })?.length ?? 0;

  async function onSubmit(values: SalesInquiryInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: SalesResponse;
    try {
      const response = await fetch("/api/leads/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, sourcePage: window.location.pathname || "/forklift-sales" }),
      });
      result = (await response.json()) as SalesResponse;
    } catch {
      setErrorMessage(navigator.onLine === false ? q.offline : q.sendFailed);
      return;
    }

    if (!result.ok) {
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string }[]) {
        const field = detail.path?.[0];
        if (typeof field === "string" && field in values && field !== "sourcePage") {
          setError(field as keyof SalesInquiryInput, { message: detail.message }, { shouldFocus: !placed });
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
      <form onSubmit={submit} id="forklift-inquiry" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="fs-homepageUrl">
            {q.trap}
            <input id="fs-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="fs-condition" label={t.condition} error={errors.condition}>
            <NativeSelect id="fs-condition" {...describedBy("fs-condition", errors.condition)} {...register("condition")}>
              {salesConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {t.conditions[condition]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="fs-environment" label={t.environment} error={errors.environment}>
            <NativeSelect id="fs-environment" {...describedBy("fs-environment", errors.environment)} {...register("environment")}>
              {environments.map((environment) => (
                <option key={environment} value={environment}>
                  {t.environments[environment]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="fs-capacity" label={t.capacity} error={errors.capacity} optional={q.optional}>
            <p id="fs-capacity-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.capacityHint}
            </p>
            <Input
              id="fs-capacity"
              maxLength={40}
              {...describedBy("fs-capacity", errors.capacity, false)}
              aria-describedby={["fs-capacity-hint", errors.capacity ? "fs-capacity-error" : ""].filter(Boolean).join(" ")}
              {...register("capacity")}
            />
          </Field>
          <Field id="fs-liftHeight" label={t.liftHeight} error={errors.liftHeight} optional={q.optional}>
            <p id="fs-liftHeight-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.liftHeightHint}
            </p>
            <Input
              id="fs-liftHeight"
              maxLength={40}
              {...describedBy("fs-liftHeight", errors.liftHeight, false)}
              aria-describedby={["fs-liftHeight-hint", errors.liftHeight ? "fs-liftHeight-error" : ""].filter(Boolean).join(" ")}
              {...register("liftHeight")}
            />
          </Field>
          <Field id="fs-location" label={t.location} error={errors.location}>
            <Input id="fs-location" maxLength={120} {...describedBy("fs-location", errors.location)} {...register("location")} />
          </Field>
          <Field id="fs-application" label={t.application} error={errors.application} optional={q.optional}>
            <Input id="fs-application" maxLength={100} {...describedBy("fs-application", errors.application, false)} {...register("application")} />
          </Field>
          <Field id="fs-requirementDetail" label={t.requirementDetail} error={errors.requirementDetail} wide>
            <p id="fs-requirementDetail-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.requirementHint}
            </p>
            <Textarea
              id="fs-requirementDetail"
              rows={4}
              maxLength={500}
              {...describedBy("fs-requirementDetail", errors.requirementDetail)}
              aria-describedby={["fs-requirementDetail-hint", "fs-requirementDetail-count", errors.requirementDetail ? "fs-requirementDetail-error" : ""]
                .filter(Boolean)
                .join(" ")}
              {...register("requirementDetail")}
            />
            <small id="fs-requirementDetail-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {detailLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="fs-preferredBrand" label={t.preferredBrand} error={errors.preferredBrand} optional={q.optional}>
            <Input id="fs-preferredBrand" maxLength={60} {...describedBy("fs-preferredBrand", errors.preferredBrand, false)} {...register("preferredBrand")} />
          </Field>
          <Field id="fs-timeline" label={c.timeline} optional={q.optional}>
            <NativeSelect id="fs-timeline" {...describedBy("fs-timeline", undefined, false)} {...register("timeline")}>
              <option value="">{s.choose}</option>
              {contactTimelines.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {c.timelines[timeline]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="fs-budgetRange" label={t.budgetRange} error={errors.budgetRange} optional={q.optional} wide>
            <Input id="fs-budgetRange" maxLength={60} {...describedBy("fs-budgetRange", errors.budgetRange, false)} {...register("budgetRange")} />
          </Field>
          <Field id="fs-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="fs-companyName" autoComplete="organization" {...describedBy("fs-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="fs-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="fs-contactPerson" autoComplete="name" {...describedBy("fs-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="fs-phone" label={q.phone} error={errors.phone}>
            <Input id="fs-phone" type="tel" autoComplete="tel" {...describedBy("fs-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="fs-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="fs-email" type="email" autoComplete="email" {...describedBy("fs-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="fs-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect id="fs-preferredContactMethod" {...describedBy("fs-preferredContactMethod", errors.preferredContactMethod)} {...register("preferredContactMethod")}>
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
