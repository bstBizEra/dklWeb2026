"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import {
  cleaningMachines,
  cleaningRequestSchemaFor,
  cleaningSites,
  customerTypes,
  frequencies,
  type CleaningRequestInput,
} from "@/lib/validation/cleaning";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { en, type Messages } from "@/messages/en";

type CleaningResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (CleaningRecommendationWizard), rebuilt as one page on the quote
// form's parts: same honeypot, field errors, offline message and reference number.
const emptyValues = (): CleaningRequestInput => ({
  machine: "not-sure",
  site: "LARGE_FLOORS",
  customerType: "BUSINESS",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  location: "",
  areaSize: "",
  frequency: "",
  timeline: "",
  budgetRange: "",
  requirementDetail: "",
  sourcePage: "/cleaning-equipment",
  homepageUrl: "",
});

type CleaningRequestFormProps = {
  // getMessages(locale).cleaningForm, .serviceForm ("Choose"), .contactForm (contact methods and timelines)
  // and .quoteForm (shared texts).
  labels?: Messages["cleaningForm"];
  service?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
};

export function CleaningRequestForm({
  labels: t = en.cleaningForm,
  service: s = en.serviceForm,
  contact: c = en.contactForm,
  shared: q = en.quoteForm,
}: CleaningRequestFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schema] = useState(() => cleaningRequestSchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CleaningRequestInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const detailLength = useWatch({ control, name: "requirementDetail" })?.length ?? 0;

  async function onSubmit(values: CleaningRequestInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: CleaningResponse;
    try {
      const response = await fetch("/api/leads/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, sourcePage: window.location.pathname || "/cleaning-equipment" }),
      });
      result = (await response.json()) as CleaningResponse;
    } catch {
      setErrorMessage(navigator.onLine === false ? q.offline : q.sendFailed);
      return;
    }

    if (!result.ok) {
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string }[]) {
        const field = detail.path?.[0];
        if (typeof field === "string" && field in values && field !== "sourcePage") {
          setError(field as keyof CleaningRequestInput, { message: detail.message }, { shouldFocus: !placed });
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
      <form onSubmit={submit} id="cleaning-request" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="cl-homepageUrl">
            {q.trap}
            <input id="cl-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="cl-site" label={t.site} error={errors.site}>
            <NativeSelect id="cl-site" {...describedBy("cl-site", errors.site)} {...register("site")}>
              {cleaningSites.map((site) => (
                <option key={site} value={site}>
                  {t.sites[site]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="cl-machine" label={t.machine} error={errors.machine}>
            <NativeSelect id="cl-machine" {...describedBy("cl-machine", errors.machine)} {...register("machine")}>
              {cleaningMachines.map((machine) => (
                <option key={machine} value={machine}>
                  {t.machines[machine]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="cl-customerType" label={t.customerType} error={errors.customerType}>
            <NativeSelect id="cl-customerType" {...describedBy("cl-customerType", errors.customerType)} {...register("customerType")}>
              {customerTypes.map((type) => (
                <option key={type} value={type}>
                  {t.customerTypes[type]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="cl-frequency" label={t.frequency} optional={q.optional}>
            <NativeSelect id="cl-frequency" {...describedBy("cl-frequency", undefined, false)} {...register("frequency")}>
              <option value="">{s.choose}</option>
              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {t.frequencies[frequency]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="cl-location" label={t.location} error={errors.location}>
            <Input id="cl-location" maxLength={120} {...describedBy("cl-location", errors.location)} {...register("location")} />
          </Field>
          <Field id="cl-areaSize" label={t.areaSize} error={errors.areaSize} optional={q.optional}>
            <p id="cl-areaSize-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.areaSizeHint}
            </p>
            <Input
              id="cl-areaSize"
              maxLength={60}
              {...describedBy("cl-areaSize", errors.areaSize, false)}
              aria-describedby={["cl-areaSize-hint", errors.areaSize ? "cl-areaSize-error" : ""].filter(Boolean).join(" ")}
              {...register("areaSize")}
            />
          </Field>
          <Field id="cl-requirementDetail" label={t.requirementDetail} error={errors.requirementDetail} wide>
            <p id="cl-requirementDetail-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.requirementHint}
            </p>
            <Textarea
              id="cl-requirementDetail"
              rows={4}
              maxLength={500}
              {...describedBy("cl-requirementDetail", errors.requirementDetail)}
              aria-describedby={["cl-requirementDetail-hint", "cl-requirementDetail-count", errors.requirementDetail ? "cl-requirementDetail-error" : ""]
                .filter(Boolean)
                .join(" ")}
              {...register("requirementDetail")}
            />
            <small id="cl-requirementDetail-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {detailLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="cl-timeline" label={c.timeline} optional={q.optional}>
            <NativeSelect id="cl-timeline" {...describedBy("cl-timeline", undefined, false)} {...register("timeline")}>
              <option value="">{s.choose}</option>
              {contactTimelines.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {c.timelines[timeline]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="cl-budgetRange" label={t.budgetRange} error={errors.budgetRange} optional={q.optional}>
            <Input id="cl-budgetRange" maxLength={60} {...describedBy("cl-budgetRange", errors.budgetRange, false)} {...register("budgetRange")} />
          </Field>
          <Field id="cl-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="cl-companyName" autoComplete="organization" {...describedBy("cl-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="cl-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="cl-contactPerson" autoComplete="name" {...describedBy("cl-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="cl-phone" label={q.phone} error={errors.phone}>
            <Input id="cl-phone" type="tel" autoComplete="tel" {...describedBy("cl-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="cl-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="cl-email" type="email" autoComplete="email" {...describedBy("cl-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="cl-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect id="cl-preferredContactMethod" {...describedBy("cl-preferredContactMethod", errors.preferredContactMethod)} {...register("preferredContactMethod")}>
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
