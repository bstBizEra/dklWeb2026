"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  quoteRequestSchema,
  type ApiError,
  type ApiSuccess,
  type QuoteRequestInput,
} from "@/lib/validation/leads";

type QuoteResponse = ApiSuccess<{ leadId: string; status: string }> | ApiError;

const categoryOptions = [
  "Forklift rental",
  "New forklift sales",
  "Used forklift inquiry",
  "Spare parts",
  "Maintenance service",
  "Warehouse solutions",
  "Cleaning equipment",
  "Material handling",
  "Batteries and chargers",
  "General inquiry",
];

export function QuoteRequestForm({
  initialCategory = "Forklift rental",
  leadType = "QUOTE_REQUEST",
}: {
  initialCategory?: string;
  leadType?: QuoteRequestInput["leadType"];
}) {
  const [retryKey, setRetryKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      leadType,
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      equipmentOrServiceCategory: initialCategory,
      message: "",
      sourcePage: "/",
    },
  });

  async function onSubmit(values: QuoteRequestInput) {
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      ...values,
      sourcePage: window.location.pathname || "/",
    };

    const key = retryKey ?? crypto.randomUUID();
    setRetryKey(key);
    try {
      const response = await fetch("/api/leads/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as QuoteResponse;
      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }
      setSuccessMessage(result.message);
      setRetryKey(null);
      reset({
        leadType, companyName: "", contactPerson: "", phone: "", email: "",
        equipmentOrServiceCategory: initialCategory, message: "", sourcePage: window.location.pathname || "/",
      });
    } catch {
      setErrorMessage("Your request could not be confirmed. Please retry or contact DK LAO directly.");
    }
  }

  return (
    <form className="quote-form dk-card" onSubmit={handleSubmit(onSubmit)} id="quote-request">
      <div className="quote-form__header">
        <p className="dk-eyebrow">Central quote request</p>
        <h2>Tell DK LAO what your operation needs</h2>
        <p>
          Share the equipment or service category, site context, and contact details
          so the right advisor can review your request.
        </p>
      </div>

      <input type="hidden" value={leadType} {...register("leadType")} />
      <input type="hidden" value="/" {...register("sourcePage")} />

      <div className="quote-form__grid">
        <label htmlFor="companyName">
          <span>Company name</span>
          <input id="companyName" autoComplete="organization" {...register("companyName")} />
          {errors.companyName ? <small>{errors.companyName.message}</small> : null}
        </label>
        <label htmlFor="contactPerson">
          <span>Contact person</span>
          <input id="contactPerson" autoComplete="name" {...register("contactPerson")} />
          {errors.contactPerson ? <small>{errors.contactPerson.message}</small> : null}
        </label>
        <label htmlFor="phone">
          <span>Phone number</span>
          <input id="phone" autoComplete="tel" {...register("phone")} />
          {errors.phone ? <small>{errors.phone.message}</small> : null}
        </label>
        <label htmlFor="email">
          <span>Email</span>
          <input id="email" autoComplete="email" {...register("email")} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>
        <label className="quote-form__wide" htmlFor="equipmentOrServiceCategory">
          <span>Equipment or service category</span>
          <select
            id="equipmentOrServiceCategory"
            aria-label="Equipment or service category"
            {...register("equipmentOrServiceCategory")}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.equipmentOrServiceCategory ? (
            <small>{errors.equipmentOrServiceCategory.message}</small>
          ) : null}
        </label>
        <label className="quote-form__wide" htmlFor="message">
          <span>Requirement details</span>
          <textarea id="message" rows={5} {...register("message")} />
          {errors.message ? <small>{errors.message.message}</small> : null}
        </label>
      </div>

      {successMessage ? (
        <p className="quote-form__status quote-form__status--success">
          <CheckCircle2 size={18} aria-hidden="true" />
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="quote-form__status quote-form__status--error">
          <AlertCircle size={18} aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}

      <button className="dk-button dk-button-primary quote-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending Request" : "Request a Quote"}
        <Send size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
