"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { leadRequestInit, PhotoField } from "@/components/dklao/photo-field";
import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { contactMethods, contactTimelines } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { installationChoices, warehouseInquirySchemaFor, warehouseNeeds, type WarehouseInquiryInput } from "@/lib/validation/warehouse";
import { en, type Messages } from "@/messages/en";

type WarehouseResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (WarehouseInquiryForm), rebuilt on the quote form's parts: same
// honeypot, field errors, offline message and reference number. Layout upload comes in a later stage.
const emptyValues = (): WarehouseInquiryInput => ({
  need: "racking-shelving",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  siteLocation: "",
  warehouseSize: "",
  goodsType: "",
  estimatedLoad: "",
  installationNeed: "NOT_SURE",
  timeline: "",
  budgetRange: "",
  requirementDetail: "",
  sourcePage: "/warehouse-equipment",
  homepageUrl: "",
});

type WarehouseInquiryFormProps = {
  // getMessages(locale).warehouseForm, .serviceForm (yes/no answers, "Choose"), .contactForm (contact
  // methods and timelines) and .quoteForm (shared texts).
  labels?: Messages["warehouseForm"];
  service?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
  photos?: Messages["photoUpload"];
};

export function WarehouseInquiryForm({
  labels: t = en.warehouseForm,
  service: s = en.serviceForm,
  contact: c = en.contactForm,
  shared: q = en.quoteForm, photos: p = en.photoUpload,
}: WarehouseInquiryFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [schema] = useState(() => warehouseInquirySchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseInquiryInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const detailLength = useWatch({ control, name: "requirementDetail" })?.length ?? 0;

  async function onSubmit(values: WarehouseInquiryInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: WarehouseResponse;
    try {
      const response = await fetch("/api/leads/warehouse", {
        ...leadRequestInit({ ...values, sourcePage: window.location.pathname || "/warehouse-equipment" }, photos),
      });
      result = (await response.json()) as WarehouseResponse;
    } catch {
      setErrorMessage(navigator.onLine === false ? q.offline : q.sendFailed);
      return;
    }

    if (!result.ok) {
      let placed = false;
      for (const detail of result.error.details as { path?: unknown[]; message?: string; code?: string }[]) {
        const field = detail.path?.[0];
        if (field === "photos") {
          setPhotoError(p.errors[detail.code as keyof typeof p.errors] ?? detail.message ?? "");
          placed = true;
          continue;
        }
        if (typeof field === "string" && field in values && field !== "sourcePage") {
          setError(field as keyof WarehouseInquiryInput, { message: detail.message }, { shouldFocus: !placed });
          placed = true;
        }
      }
      setErrorMessage(placed ? q.checkFields : (q.serverErrors[result.error.code] ?? result.error.message));
      return;
    }

    setSuccessMessage(`${q.received || result.message} ${q.reference} ${result.data.leadId}.`);
    reset(emptyValues());
    setPhotos([]);
    setPhotoError("");
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
      <form onSubmit={submit} id="warehouse-inquiry" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="wh-homepageUrl">
            {q.trap}
            <input id="wh-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="wh-need" label={t.need} error={errors.need}>
            <NativeSelect id="wh-need" {...describedBy("wh-need", errors.need)} {...register("need")}>
              {warehouseNeeds.map((need) => (
                <option key={need} value={need}>
                  {t.needs[need]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="wh-siteLocation" label={t.siteLocation} error={errors.siteLocation}>
            <Input id="wh-siteLocation" maxLength={120} {...describedBy("wh-siteLocation", errors.siteLocation)} {...register("siteLocation")} />
          </Field>
          <Field id="wh-warehouseSize" label={t.warehouseSize} error={errors.warehouseSize} optional={q.optional}>
            <p id="wh-warehouseSize-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.warehouseSizeHint}
            </p>
            <Input
              id="wh-warehouseSize"
              maxLength={60}
              {...describedBy("wh-warehouseSize", errors.warehouseSize, false)}
              aria-describedby={["wh-warehouseSize-hint", errors.warehouseSize ? "wh-warehouseSize-error" : ""].filter(Boolean).join(" ")}
              {...register("warehouseSize")}
            />
          </Field>
          <Field id="wh-estimatedLoad" label={t.estimatedLoad} error={errors.estimatedLoad} optional={q.optional}>
            <Input id="wh-estimatedLoad" maxLength={60} {...describedBy("wh-estimatedLoad", errors.estimatedLoad, false)} {...register("estimatedLoad")} />
          </Field>
          <Field id="wh-goodsType" label={t.goodsType} error={errors.goodsType} optional={q.optional} wide>
            <Input id="wh-goodsType" maxLength={100} {...describedBy("wh-goodsType", errors.goodsType, false)} {...register("goodsType")} />
          </Field>
          <Field id="wh-requirementDetail" label={t.requirementDetail} error={errors.requirementDetail} wide>
            <p id="wh-requirementDetail-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.requirementHint}
            </p>
            <Textarea
              id="wh-requirementDetail"
              rows={4}
              maxLength={500}
              {...describedBy("wh-requirementDetail", errors.requirementDetail)}
              aria-describedby={["wh-requirementDetail-hint", "wh-requirementDetail-count", errors.requirementDetail ? "wh-requirementDetail-error" : ""]
                .filter(Boolean)
                .join(" ")}
              {...register("requirementDetail")}
            />
            <small id="wh-requirementDetail-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {detailLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="wh-installationNeed" label={t.installationNeed} error={errors.installationNeed}>
            <NativeSelect id="wh-installationNeed" {...describedBy("wh-installationNeed", errors.installationNeed)} {...register("installationNeed")}>
              {installationChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {s.quotationChoices[choice]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="wh-timeline" label={c.timeline} optional={q.optional}>
            <NativeSelect id="wh-timeline" {...describedBy("wh-timeline", undefined, false)} {...register("timeline")}>
              <option value="">{s.choose}</option>
              {contactTimelines.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {c.timelines[timeline]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="wh-budgetRange" label={t.budgetRange} error={errors.budgetRange} optional={q.optional} wide>
            <Input id="wh-budgetRange" maxLength={60} {...describedBy("wh-budgetRange", errors.budgetRange, false)} {...register("budgetRange")} />
          </Field>
          <PhotoField id="wh-photos" files={photos} error={photoError} labels={p} optional={q.optional} onChange={setPhotos} onError={setPhotoError} />
          <Field id="wh-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="wh-companyName" autoComplete="organization" {...describedBy("wh-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="wh-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="wh-contactPerson" autoComplete="name" {...describedBy("wh-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="wh-phone" label={q.phone} error={errors.phone}>
            <Input id="wh-phone" type="tel" autoComplete="tel" {...describedBy("wh-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="wh-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="wh-email" type="email" autoComplete="email" {...describedBy("wh-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="wh-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect id="wh-preferredContactMethod" {...describedBy("wh-preferredContactMethod", errors.preferredContactMethod)} {...register("preferredContactMethod")}>
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
