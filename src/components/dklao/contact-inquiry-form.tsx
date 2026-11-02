"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/section";
import {
  contactConditions,
  contactInquirySchemaFor,
  contactInquiryTypes,
  contactMethods,
  contactTimelines,
  type ContactInquiryInput,
} from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { en, type Messages } from "@/messages/en";

type ContactResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (SmartInquiryForm), rebuilt on the quote form's parts: same
// honeypot, field errors, offline message and reference number. The equipment questions only show for
// inquiries about equipment. Uploads come in a later stage.
const equipmentInquiries = new Set<string>([
  "Request Quote",
  "Forklift Rental",
  "Forklift Sales",
  "Used Forklift",
  "Cleaning Equipment",
  "Warehouse Solutions",
]);
const productCategories = Object.keys(en.contactForm.productCategories) as (keyof Messages["contactForm"]["productCategories"])[];

const emptyValues = (): ContactInquiryInput => ({
  inquiryType: "Request Quote",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  productCategory: "",
  equipmentType: "",
  condition: "",
  capacityRequirement: "",
  liftHeight: "",
  location: "",
  timeline: "",
  message: "",
  sourcePage: "/contact",
  homepageUrl: "",
});

type ContactInquiryFormProps = {
  // getMessages(locale).contactForm and .quoteForm (the shared texts), passed from the server page.
  labels?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
};

export function ContactInquiryForm({ labels: t = en.contactForm, shared: q = en.quoteForm }: ContactInquiryFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schema] = useState(() => contactInquirySchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactInquiryInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const inquiryType = useWatch({ control, name: "inquiryType" });
  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;
  const askEquipment = equipmentInquiries.has(inquiryType);

  async function onSubmit(values: ContactInquiryInput) {
    setSuccessMessage("");
    setErrorMessage("");

    // Equipment answers left over from an earlier choice are not sent with a service or parts inquiry.
    const payload = askEquipment
      ? values
      : { ...values, productCategory: "", equipmentType: "", condition: "", capacityRequirement: "", liftHeight: "", timeline: "" };

    let result: ContactResponse;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, sourcePage: window.location.pathname || "/contact" }),
      });
      result = (await response.json()) as ContactResponse;
    } catch {
      setErrorMessage(navigator.onLine === false ? q.offline : q.sendFailed);
      return;
    }

    if (!result.ok) {
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string }[]) {
        const field = detail.path?.[0];
        if (typeof field === "string" && field in payload && field !== "sourcePage") {
          setError(field as keyof ContactInquiryInput, { message: detail.message }, { shouldFocus: !placed });
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
      <form onSubmit={submit} id="contact-inquiry" className="scroll-mt-[110px]" noValidate>
        <div className="mb-6 grid gap-3">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 className="m-0 text-[2.2rem] font-[850] leading-[1.08] tracking-[-0.03em] text-navy-950 max-[780px]:text-[1.8rem]">
            {t.title}
          </h2>
          <p className="m-0 leading-[1.75] text-slate-700">{t.copy}</p>
        </div>

        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="contact-homepageUrl">
            {q.trap}
            <input id="contact-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="inquiryType" label={t.inquiryType} error={errors.inquiryType}>
            <NativeSelect id="inquiryType" {...describedBy("inquiryType", errors.inquiryType)} {...register("inquiryType")}>
              {contactInquiryTypes.map((type) => (
                <option key={type} value={type}>
                  {t.inquiryTypes[type]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="preferredContactMethod" label={t.preferredContactMethod} error={errors.preferredContactMethod}>
            <NativeSelect
              id="preferredContactMethod"
              {...describedBy("preferredContactMethod", errors.preferredContactMethod)}
              {...register("preferredContactMethod")}
            >
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {t.methods[method]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="contact-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="contact-companyName" autoComplete="organization" {...describedBy("contact-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="contact-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="contact-contactPerson" autoComplete="name" {...describedBy("contact-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="contact-phone" label={q.phone} error={errors.phone}>
            <Input id="contact-phone" type="tel" autoComplete="tel" {...describedBy("contact-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="contact-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="contact-email" type="email" autoComplete="email" {...describedBy("contact-email", errors.email, false)} {...register("email")} />
          </Field>

          {askEquipment ? (
            <>
              <Field id="productCategory" label={t.productCategory} optional={q.optional}>
                <NativeSelect id="productCategory" {...describedBy("productCategory", undefined, false)} {...register("productCategory")}>
                  <option value="">{t.choose}</option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {t.productCategories[category]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field id="condition" label={t.condition} optional={q.optional}>
                <NativeSelect id="condition" {...describedBy("condition", undefined, false)} {...register("condition")}>
                  <option value="">{t.choose}</option>
                  {contactConditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {t.conditions[condition]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field id="equipmentType" label={t.equipmentType} error={errors.equipmentType} optional={q.optional}>
                <Input id="equipmentType" maxLength={80} {...describedBy("equipmentType", errors.equipmentType, false)} {...register("equipmentType")} />
              </Field>
              <Field id="capacityRequirement" label={t.capacityRequirement} error={errors.capacityRequirement} optional={q.optional}>
                <Input id="capacityRequirement" maxLength={40} {...describedBy("capacityRequirement", errors.capacityRequirement, false)} {...register("capacityRequirement")} />
              </Field>
              <Field id="liftHeight" label={t.liftHeight} error={errors.liftHeight} optional={q.optional}>
                <Input id="liftHeight" maxLength={40} {...describedBy("liftHeight", errors.liftHeight, false)} {...register("liftHeight")} />
              </Field>
              <Field id="timeline" label={t.timeline} optional={q.optional}>
                <NativeSelect id="timeline" {...describedBy("timeline", undefined, false)} {...register("timeline")}>
                  <option value="">{t.choose}</option>
                  {contactTimelines.map((timeline) => (
                    <option key={timeline} value={timeline}>
                      {t.timelines[timeline]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </>
          ) : null}

          <Field id="contact-location" label={t.location} error={errors.location} optional={q.optional} wide>
            <Input id="contact-location" maxLength={120} {...describedBy("contact-location", errors.location, false)} {...register("location")} />
          </Field>
          <Field id="contact-message" label={q.message} error={errors.message} wide>
            <p id="contact-message-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.messageHint}
            </p>
            <Textarea
              id="contact-message"
              rows={5}
              maxLength={650}
              {...describedBy("contact-message", errors.message)}
              aria-describedby={["contact-message-hint", "contact-message-count", errors.message ? "contact-message-error" : ""].filter(Boolean).join(" ")}
              {...register("message")}
            />
            <small id="contact-message-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {messageLength.toLocaleString("en-US")} / 650
            </small>
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
