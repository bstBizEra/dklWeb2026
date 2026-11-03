"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Wrench } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { leadRequestInit, PhotoField } from "@/components/dklao/photo-field";
import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { contactMethods } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import {
  productFamilies,
  quotationChoices,
  serviceBookingSchemaFor,
  serviceTypes,
  urgencies,
  type ServiceBookingInput,
} from "@/lib/validation/service";
import { en, type Messages } from "@/messages/en";

type ServiceResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (ServiceHub), rebuilt on the quote form's parts: same honeypot,
// field errors, offline message and reference number. Photo upload comes in a later stage.
const emptyValues = (): ServiceBookingInput => ({
  serviceType: "preventive-maintenance",
  productFamily: "forklift",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  equipmentBrand: "",
  equipmentModel: "",
  serialNumber: "",
  siteLocation: "",
  urgency: "NORMAL",
  preferredServiceDate: "",
  quotationChoice: "",
  requirementDetail: "",
  sourcePage: "/maintenance-service",
  homepageUrl: "",
});

type ServiceBookingFormProps = {
  // getMessages(locale).serviceForm, .contactForm (contact methods) and .quoteForm (shared texts).
  labels?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
  photos?: Messages["photoUpload"];
};

export function ServiceBookingForm({ labels: t = en.serviceForm, contact: c = en.contactForm, shared: q = en.quoteForm, photos: p = en.photoUpload }: ServiceBookingFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [schema] = useState(() => serviceBookingSchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceBookingInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const detailLength = useWatch({ control, name: "requirementDetail" })?.length ?? 0;

  async function onSubmit(values: ServiceBookingInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: ServiceResponse;
    try {
      const response = await fetch("/api/leads/service", {
        ...leadRequestInit({ ...values, sourcePage: window.location.pathname || "/maintenance-service" }, photos),
      });
      result = (await response.json()) as ServiceResponse;
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
          setError(field as keyof ServiceBookingInput, { message: detail.message }, { shouldFocus: !placed });
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
      <form onSubmit={submit} id="service-booking" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="service-homepageUrl">
            {q.trap}
            <input id="service-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="serviceType" label={t.serviceType} error={errors.serviceType}>
            <NativeSelect id="serviceType" {...describedBy("serviceType", errors.serviceType)} {...register("serviceType")}>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {t.serviceTypes[type]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="urgency" label={t.urgency} error={errors.urgency}>
            <NativeSelect id="urgency" {...describedBy("urgency", errors.urgency)} {...register("urgency")}>
              {urgencies.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {t.urgencies[urgency]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="productFamily" label={t.productFamily} error={errors.productFamily}>
            <NativeSelect id="productFamily" {...describedBy("productFamily", errors.productFamily)} {...register("productFamily")}>
              {productFamilies.map((family) => (
                <option key={family} value={family}>
                  {t.productFamilies[family]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="equipmentBrand" label={t.equipmentBrand} error={errors.equipmentBrand}>
            <Input id="equipmentBrand" maxLength={60} {...describedBy("equipmentBrand", errors.equipmentBrand)} {...register("equipmentBrand")} />
          </Field>
          <Field id="equipmentModel" label={t.equipmentModel} error={errors.equipmentModel} optional={q.optional}>
            <Input id="equipmentModel" maxLength={60} {...describedBy("equipmentModel", errors.equipmentModel, false)} {...register("equipmentModel")} />
          </Field>
          <Field id="serialNumber" label={t.serialNumber} error={errors.serialNumber} optional={q.optional}>
            <Input id="serialNumber" maxLength={60} {...describedBy("serialNumber", errors.serialNumber, false)} {...register("serialNumber")} />
          </Field>
          <Field id="siteLocation" label={t.siteLocation} error={errors.siteLocation} wide>
            <Input id="siteLocation" maxLength={120} {...describedBy("siteLocation", errors.siteLocation)} {...register("siteLocation")} />
          </Field>
          <Field id="requirementDetail" label={t.requirementDetail} error={errors.requirementDetail} wide>
            <p id="requirementDetail-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-muted-foreground">
              {t.requirementHint}
            </p>
            <Textarea
              id="requirementDetail"
              rows={4}
              maxLength={500}
              {...describedBy("requirementDetail", errors.requirementDetail)}
              aria-describedby={["requirementDetail-hint", "requirementDetail-count", errors.requirementDetail ? "requirementDetail-error" : ""].filter(Boolean).join(" ")}
              {...register("requirementDetail")}
            />
            <small id="requirementDetail-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {detailLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="preferredServiceDate" label={t.preferredServiceDate} error={errors.preferredServiceDate} optional={q.optional}>
            <Input id="preferredServiceDate" maxLength={40} {...describedBy("preferredServiceDate", errors.preferredServiceDate, false)} {...register("preferredServiceDate")} />
          </Field>
          <Field id="quotationChoice" label={t.quotationChoice} optional={q.optional}>
            <NativeSelect id="quotationChoice" {...describedBy("quotationChoice", undefined, false)} {...register("quotationChoice")}>
              <option value="">{t.choose}</option>
              {quotationChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {t.quotationChoices[choice]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <PhotoField id="service-photos" files={photos} error={photoError} labels={p} optional={q.optional} onChange={setPhotos} onError={setPhotoError} />
          <Field id="service-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="service-companyName" autoComplete="organization" {...describedBy("service-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="service-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="service-contactPerson" autoComplete="name" {...describedBy("service-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="service-phone" label={q.phone} error={errors.phone}>
            <Input id="service-phone" type="tel" autoComplete="tel" {...describedBy("service-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="service-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="service-email" type="email" autoComplete="email" {...describedBy("service-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="service-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect
              id="service-preferredContactMethod"
              {...describedBy("service-preferredContactMethod", errors.preferredContactMethod)}
              {...register("preferredContactMethod")}
            >
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
          <Wrench size={18} aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
