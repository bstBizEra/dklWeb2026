"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Package } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { leadRequestInit, PhotoField } from "@/components/dklao/photo-field";
import { describedBy, Field } from "@/components/dklao/quote-request-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { contactMethods } from "@/lib/validation/contact";
import type { ApiError, ApiSuccess } from "@/lib/validation/leads";
import { installationChoices, partsRequestSchemaFor, partTypes, productGroups, type PartsRequestInput } from "@/lib/validation/parts";
import { urgencies } from "@/lib/validation/service";
import { en, type Messages } from "@/messages/en";

type PartsResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

// Ported from feature/services-all-products (PartsPage), rebuilt on the quote form's parts: same honeypot,
// field errors, offline message and reference number. Photo upload comes in a later stage.
const emptyValues = (): PartsRequestInput => ({
  productGroup: "forklift",
  partType: "SPARE_PART",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  preferredContactMethod: "Phone",
  equipmentType: "",
  equipmentBrand: "",
  equipmentModel: "",
  serialNumber: "",
  partDescription: "",
  quantity: "",
  urgency: "NORMAL",
  installationNeed: "NOT_SURE",
  location: "",
  sourcePage: "/spare-parts",
  homepageUrl: "",
});

type PartsRequestFormProps = {
  // getMessages(locale).partsForm, .serviceForm (urgency and yes/no answers), .contactForm (contact
  // methods) and .quoteForm (shared texts).
  labels?: Messages["partsForm"];
  service?: Messages["serviceForm"];
  contact?: Messages["contactForm"];
  shared?: Messages["quoteForm"];
  photos?: Messages["photoUpload"];
};

export function PartsRequestForm({
  labels: t = en.partsForm,
  service: s = en.serviceForm,
  contact: c = en.contactForm,
  shared: q = en.quoteForm, photos: p = en.photoUpload,
}: PartsRequestFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [schema] = useState(() => partsRequestSchemaFor(t.validation));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PartsRequestInput>({ resolver: zodResolver(schema), defaultValues: emptyValues(), mode: "onTouched" });
  const descriptionLength = useWatch({ control, name: "partDescription" })?.length ?? 0;

  async function onSubmit(values: PartsRequestInput) {
    setSuccessMessage("");
    setErrorMessage("");

    let result: PartsResponse;
    try {
      const response = await fetch("/api/leads/spare-parts", {
        ...leadRequestInit({ ...values, sourcePage: window.location.pathname || "/spare-parts" }, photos),
      });
      result = (await response.json()) as PartsResponse;
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
          setError(field as keyof PartsRequestInput, { message: detail.message }, { shouldFocus: !placed });
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
      <form onSubmit={submit} id="parts-request" className="scroll-mt-[110px]" noValidate>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. Only a bot fills it. */}
        <div className="quote-form__trap absolute -left-[10000px] size-px overflow-hidden" aria-hidden="true">
          <label htmlFor="parts-homepageUrl">
            {q.trap}
            <input id="parts-homepageUrl" type="text" tabIndex={-1} autoComplete="off" {...register("homepageUrl")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
          <Field id="parts-productGroup" label={t.productGroup} error={errors.productGroup}>
            <NativeSelect id="parts-productGroup" {...describedBy("parts-productGroup", errors.productGroup)} {...register("productGroup")}>
              {productGroups.map((group) => (
                <option key={group} value={group}>
                  {t.productGroups[group]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="parts-partType" label={t.partType} error={errors.partType}>
            <NativeSelect id="parts-partType" {...describedBy("parts-partType", errors.partType)} {...register("partType")}>
              {partTypes.map((type) => (
                <option key={type} value={type}>
                  {t.partTypes[type]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="parts-equipmentType" label={t.equipmentType} error={errors.equipmentType} wide>
            <p id="parts-equipmentType-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.equipmentTypeHint}
            </p>
            <Input
              id="parts-equipmentType"
              maxLength={80}
              {...describedBy("parts-equipmentType", errors.equipmentType)}
              aria-describedby={["parts-equipmentType-hint", errors.equipmentType ? "parts-equipmentType-error" : ""].filter(Boolean).join(" ")}
              {...register("equipmentType")}
            />
          </Field>
          <Field id="parts-equipmentBrand" label={t.equipmentBrand} error={errors.equipmentBrand}>
            <Input id="parts-equipmentBrand" maxLength={60} {...describedBy("parts-equipmentBrand", errors.equipmentBrand)} {...register("equipmentBrand")} />
          </Field>
          <Field id="parts-equipmentModel" label={t.equipmentModel} error={errors.equipmentModel} optional={q.optional}>
            <Input id="parts-equipmentModel" maxLength={60} {...describedBy("parts-equipmentModel", errors.equipmentModel, false)} {...register("equipmentModel")} />
          </Field>
          <Field id="parts-serialNumber" label={t.serialNumber} error={errors.serialNumber} optional={q.optional}>
            <Input id="parts-serialNumber" maxLength={60} {...describedBy("parts-serialNumber", errors.serialNumber, false)} {...register("serialNumber")} />
          </Field>
          <Field id="parts-quantity" label={t.quantity} error={errors.quantity}>
            <Input id="parts-quantity" maxLength={40} inputMode="numeric" {...describedBy("parts-quantity", errors.quantity)} {...register("quantity")} />
          </Field>
          <Field id="parts-partDescription" label={t.partDescription} error={errors.partDescription} wide>
            <p id="parts-partDescription-hint" className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
              {t.partDescriptionHint}
            </p>
            <Textarea
              id="parts-partDescription"
              rows={4}
              maxLength={500}
              {...describedBy("parts-partDescription", errors.partDescription)}
              aria-describedby={["parts-partDescription-hint", "parts-partDescription-count", errors.partDescription ? "parts-partDescription-error" : ""]
                .filter(Boolean)
                .join(" ")}
              {...register("partDescription")}
            />
            <small id="parts-partDescription-count" className="justify-self-end text-[12px] text-slate-500 tabular-nums">
              {descriptionLength.toLocaleString("en-US")} / 500
            </small>
          </Field>
          <Field id="parts-urgency" label={t.urgency} error={errors.urgency}>
            <NativeSelect id="parts-urgency" {...describedBy("parts-urgency", errors.urgency)} {...register("urgency")}>
              {urgencies.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {s.urgencies[urgency]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="parts-installationNeed" label={t.installationNeed} error={errors.installationNeed}>
            <NativeSelect id="parts-installationNeed" {...describedBy("parts-installationNeed", errors.installationNeed)} {...register("installationNeed")}>
              {installationChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {s.quotationChoices[choice]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="parts-location" label={t.location} error={errors.location} wide>
            <Input id="parts-location" maxLength={120} {...describedBy("parts-location", errors.location)} {...register("location")} />
          </Field>
          <PhotoField id="parts-photos" files={photos} error={photoError} labels={p} optional={q.optional} onChange={setPhotos} onError={setPhotoError} />
          <Field id="parts-companyName" label={q.companyName} error={errors.companyName}>
            <Input id="parts-companyName" autoComplete="organization" {...describedBy("parts-companyName", errors.companyName)} {...register("companyName")} />
          </Field>
          <Field id="parts-contactPerson" label={q.contactPerson} error={errors.contactPerson}>
            <Input id="parts-contactPerson" autoComplete="name" {...describedBy("parts-contactPerson", errors.contactPerson)} {...register("contactPerson")} />
          </Field>
          <Field id="parts-phone" label={q.phone} error={errors.phone}>
            <Input id="parts-phone" type="tel" autoComplete="tel" {...describedBy("parts-phone", errors.phone)} {...register("phone")} />
          </Field>
          <Field id="parts-email" label={q.email} error={errors.email} optional={q.optional}>
            <Input id="parts-email" type="email" autoComplete="email" {...describedBy("parts-email", errors.email, false)} {...register("email")} />
          </Field>
          <Field id="parts-preferredContactMethod" label={c.preferredContactMethod} error={errors.preferredContactMethod} wide>
            <NativeSelect
              id="parts-preferredContactMethod"
              {...describedBy("parts-preferredContactMethod", errors.preferredContactMethod)}
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
          <Package size={18} aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}
