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
  z.email("Enter an email like name@company.com, or leave it empty").optional(),
);

export const quoteRequestSchema = z.object({
  leadType: leadTypeSchema.default("QUOTE_REQUEST"),
  companyName: z.string().trim().min(2, "Enter your company or organisation name").max(120),
  contactPerson: z.string().trim().min(2, "Enter the name of the person we should contact").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a phone number with at least 6 digits")
    .max(40)
    .regex(/^[+()\d\s.-]+$/, "Use digits, spaces and + ( ) - only, for example +856 20 5555 1234"),
  email: optionalEmail,
  equipmentOrServiceCategory: z
    .string()
    .trim()
    .min(2, "Equipment or service category is required")
    .max(120),
  message: z.string().trim().min(10, "Describe your requirement in at least 10 characters").max(1200, "Keep the requirement under 1,200 characters"),
  sourcePage: z.string().trim().min(1).max(200).default("/"),
  submissionTimestamp: z.string().datetime().default(() => new Date().toISOString()),
  status: leadStatusSchema.default("NEW"),
  // Hidden trap field. Real visitors never fill it; the route treats a filled value as a bot.
  homepageUrl: z.string().max(200).optional(),
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
