import { z } from "zod";

import { en, type Messages } from "@/messages/en";

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFYING",
  "QUOTATION_PREPARING",
  "QUOTATION_SENT",
  "FOLLOW_UP",
  "WON",
  "LOST",
  "CLOSED",
]);

export const leadTypeSchema = z.enum([
  "QUOTE_REQUEST",
  "RENTAL_INQUIRY",
  "SERVICE_BOOKING",
  "SPARE_PARTS_INQUIRY",
  "USED_FORKLIFT_INQUIRY",
  "CLEANING_EQUIPMENT_RECOMMENDATION",
  "CONTACT_GENERAL",
]);

type ValidationMessages = Messages["quoteForm"]["validation"];

// The quote request rules. The form builds them with the visitor's language; the API route and every
// other caller use quoteRequestSchema, which carries the English messages.
export function quoteRequestSchemaFor(m: ValidationMessages = en.quoteForm.validation) {
  const optionalEmail = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.email(m.email).optional(),
  );

  return z.object({
    leadType: leadTypeSchema.default("QUOTE_REQUEST"),
    companyName: z.string().trim().min(2, m.companyName).max(120),
    contactPerson: z.string().trim().min(2, m.contactPerson).max(120),
    phone: z
      .string()
      .trim()
      .min(6, m.phoneMin)
      .max(40)
      .regex(/^[+()\d\s.-]+$/, m.phoneFormat),
    email: optionalEmail,
    equipmentOrServiceCategory: z.string().trim().min(2, m.category).max(120),
    message: z.string().trim().min(10, m.messageMin).max(1200, m.messageMax),
    sourcePage: z.string().trim().min(1).max(200).default("/"),
    submissionTimestamp: z.string().datetime().default(() => new Date().toISOString()),
    status: leadStatusSchema.default("NEW"),
    // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
    homepageUrl: z.string().max(200).optional(),
  });
}

export const quoteRequestSchema = quoteRequestSchemaFor();

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;
export type QuoteRequest = z.output<typeof quoteRequestSchema>;

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message: string;
};

export type ApiError = {
  ok: false;
  error: {
    code:
      | "VALIDATION_ERROR"
      | "AUTH_REQUIRED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "RATE_LIMITED"
      | "UPLOAD_REJECTED"
      | "INTEGRATION_FAILED"
      | "INTERNAL_ERROR";
    message: string;
    details: unknown[];
  };
};
