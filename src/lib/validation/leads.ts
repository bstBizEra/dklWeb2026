import { z } from "zod";

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

const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.email("Enter a valid email address").optional(),
);

export const quoteRequestSchema = z.object({
  leadType: leadTypeSchema.default("QUOTE_REQUEST"),
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  contactPerson: z.string().trim().min(2, "Contact person is required").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is required")
    .max(40)
    .regex(/^[+()\d\s.-]+$/, "Enter a valid phone number"),
  email: optionalEmail,
  equipmentOrServiceCategory: z
    .string()
    .trim()
    .min(2, "Equipment or service category is required")
    .max(120),
  message: z.string().trim().min(10, "Please describe your requirement").max(1200),
  sourcePage: z.string().trim().min(1).max(200).default("/"),
  submissionTimestamp: z.string().datetime().default(() => new Date().toISOString()),
  status: leadStatusSchema.default("NEW"),
});

// Public callers may send legacy status/time fields, but the server never uses them.
export const publicQuoteRequestSchema = quoteRequestSchema.omit({
  status: true,
  submissionTimestamp: true,
});

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
