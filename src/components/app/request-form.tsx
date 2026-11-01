"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Check, CheckCircle2, ChevronsUpDown, LoaderCircle, MapPin, X } from "lucide-react";

import { Group } from "@/components/app/ios";
import { categoryOptions, leadIntents, leadTypeForCategory } from "@/lib/leads/intents";
import {
  appStorageKeys,
  pinLink,
  quickContacts,
  serviceIssues,
  serviceRequestMessage,
  whatsappWithText,
  type Coordinates,
  type ServiceIssue,
} from "@/lib/data/mobile-app";
import { appHref, appLocaleOf } from "@/lib/i18n/app-locale";
import { quoteRequestSchema } from "@/lib/validation/leads";
import { appMessages, fill } from "@/messages/app-en";
import { cn } from "@/lib/utils";

// Quote and service requests in one iOS form. Both go to the same lead API as the website form.
// Contact details are remembered on this phone after a successful send, and the whole form is kept
// as a draft while typing, so a locked phone or a lost connection never loses a request.

type Mode = "quote" | "service";
type Fields = {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  message: string;
  issue: ServiceIssue;
  machine: string;
  siteAddress: string;
  description: string;
  homepageUrl: string;
};
type Errors = Partial<Record<keyof Fields, string>>;
type Status = { state: "idle" | "sending" } | { state: "sent"; leadId: string; mode: Mode } | { state: "error"; message: string };

const contactKey = appStorageKeys.contact;
const draftKey = appStorageKeys.draft;
const serviceCategory = leadIntents.service.category;
const serviceWhatsapp = quickContacts().find((contact) => contact.id === "whatsapp-service")?.href;

const blank = (category: string): Fields => ({
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  category,
  message: "",
  issue: serviceIssues[0],
  machine: "",
  siteAddress: "",
  description: "",
  homepageUrl: "",
});

function load<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as Partial<T>;
  } catch {
    return {};
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the form still works, it just is not remembered.
  }
}

// Fields in screen order, so the first problem gets focus.
const fieldOrder: (keyof Fields)[] = ["category", "message", "issue", "machine", "description", "siteAddress", "companyName", "contactPerson", "phone", "email"];

export function RequestForm({ initialMode, initialCategory }: { initialMode: Mode; initialCategory: string }) {
  const id = useId();
  const locale = appLocaleOf(usePathname() ?? "/app");
  const t = appMessages(locale).request;
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fields, setFields] = useState<Fields>(() => blank(initialCategory));
  const [pin, setPin] = useState<Coordinates | undefined>();
  const [locating, setLocating] = useState<string | undefined>();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const restored = useRef(false);

  // Restore the draft and the remembered contact once, after mount (storage is browser-only).
  useEffect(() => {
    const draft = load<Fields & { pin: Coordinates }>(draftKey);
    const contact = load<Pick<Fields, "companyName" | "contactPerson" | "phone" | "email">>(contactKey);
    const { pin: draftPin, ...draftFields } = draft;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFields((current) => ({ ...current, ...contact, ...draftFields, category: initialCategory, homepageUrl: "" }));
    if (draftPin) setPin(draftPin);
    restored.current = true;
  }, [initialCategory]);

  useEffect(() => {
    if (restored.current && status.state !== "sent") save(draftKey, { ...fields, homepageUrl: undefined, pin });
  }, [fields, pin, status.state]);

  const set = (name: keyof Fields) => (event: { target: { value: string } }) => {
    setFields((current) => ({ ...current, [name]: event.target.value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocating(t.unsupported);
      return;
    }
    setLocating(t.finding);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPin({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        setLocating(undefined);
      },
      (error) =>
        setLocating(
          error.code === error.PERMISSION_DENIED
            ? t.denied
            : t.failed,
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const payload = () =>
    mode === "service"
      ? {
          leadType: "SERVICE_BOOKING" as const,
          equipmentOrServiceCategory: serviceCategory,
          message: serviceRequestMessage({ issue: fields.issue, machine: fields.machine, siteAddress: fields.siteAddress, pin, description: fields.description }),
          sourcePage: appHref("/app/request?type=service", locale),
        }
      : {
          leadType: leadTypeForCategory(fields.category),
          equipmentOrServiceCategory: fields.category,
          message: fields.message,
          sourcePage: appHref("/app/request", locale),
        };

  const validate = (): Errors => {
    const body = { ...payload(), companyName: fields.companyName, contactPerson: fields.contactPerson, phone: fields.phone, email: fields.email };
    const result = quoteRequestSchema.safeParse(body);
    const found: Errors = {};

    for (const issue of result.success ? [] : result.error.issues) {
      const key = issue.path[0] === "message" ? (mode === "service" ? "description" : "message") : (issue.path[0] as keyof Fields);
      found[key] ??= t.validation[issue.message] ?? issue.message;
    }
    if (mode === "service" && fields.description.trim().length < 10) found.description = t.describeProblem;
    if (mode === "service" && !fields.siteAddress.trim() && !pin) found.siteAddress = t.addSite;

    return found;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.state === "sending") return;
    const found = validate();
    setErrors(found);

    const first = fieldOrder.find((name) => found[name]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/leads/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload(),
          companyName: fields.companyName,
          contactPerson: fields.contactPerson,
          phone: fields.phone,
          email: fields.email,
          homepageUrl: fields.homepageUrl,
        }),
      });
      // A reply that is not our JSON (a proxy or error page) counts as "not sent", never as a parser message.
      const result = (await response.json().catch(() => ({ ok: false }))) as { ok: boolean; data?: { leadId: string }; error?: { message: string } };

      // The API answers in English: its form checks are shown in this language, anything else as a plain "not sent".
      const apiMessage = result.error?.message;
      if (!result.ok || !result.data) throw new Error(apiMessage ? (t.validation[apiMessage] ?? (locale === "en" ? apiMessage : t.sendFailed)) : t.sendFailed);

      save(contactKey, { companyName: fields.companyName, contactPerson: fields.contactPerson, phone: fields.phone, email: fields.email });
      save(draftKey, null);
      setStatus({ state: "sent", leadId: result.data.leadId, mode });
      setFields((current) => ({ ...blank(current.category), companyName: current.companyName, contactPerson: current.contactPerson, phone: current.phone, email: current.email }));
      setPin(undefined);
      window.scrollTo({ top: 0 });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          typeof navigator !== "undefined" && !navigator.onLine
            ? t.offline
            : error instanceof Error
              ? error.message
              : t.sendFailed,
      });
    }
  };

  if (status.state === "sent") {
    return (
      <div className="grid grid-cols-1 gap-7">
        <section role="status" className="grid justify-items-center gap-2 rounded-[14px] bg-ios-cell px-5 py-8 text-center android:rounded-[28px] android:bg-md-surface-low">
          <CheckCircle2 className="size-14 text-ios-green" aria-hidden="true" />
          <p className="m-0 text-[22px] leading-7 font-bold">{t.sent}</p>
          <p className="m-0 text-[15px] leading-5 text-ios-secondary">
            {status.mode === "service"
              ? t.sentService
              : t.sentQuote}
          </p>
          <p className="m-0 mt-1 rounded-full bg-ios-fill px-3 py-1 text-[13px] font-semibold tabular-nums">{fill(t.reference, { id: status.leadId })}</p>
        </section>
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="min-h-[50px] rounded-[14px] border-0 bg-ios-cell text-[17px] font-semibold text-ios-tint active:bg-ios-fill android:min-h-12 android:rounded-full android:border android:border-md-outline android:bg-transparent android:text-[15px] android:font-medium android:text-md-primary"
        >
          {t.newRequest}
        </button>
      </div>
    );
  }

  const describe = (name: keyof Fields) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `${id}-${name}-error` } : {});
  const errorText = (name: keyof Fields) =>
    errors[name] ? (
      <span id={`${id}-${name}-error`} className="text-ios-red android:text-md-error">
        {errors[name]}
      </span>
    ) : null;
  // Every problem in a group at once, one per line, so the visitor fixes them in one pass.
  const groupErrors = (...names: (keyof Fields)[]) => {
    const found = names.filter((name) => errors[name]);
    return found.length > 0 ? <span className="grid gap-1">{found.map((name) => <span key={name}>{errorText(name)}</span>)}</span> : undefined;
  };

  // iPhone: label-left table cells. Android: Material 3 outlined text fields, label on top, primary when focused, error when invalid.
  const androidOutline =
    "android:rounded android:border android:border-md-outline android:focus-within:border-md-primary android:focus-within:shadow-[inset_0_0_0_1px_var(--md-primary)] android:has-[[aria-invalid=true]]:border-md-error";
  const cell = cn(
    "group/field flex min-h-[44px] items-center gap-3 border-b-[0.5px] border-ios-separator pr-4 pl-0 last:border-b-0",
    "android:mb-3 android:min-h-14 android:flex-col android:items-stretch android:gap-0 android:px-4 android:pt-1.5 android:pb-1 android:last:mb-0 android:last:border-b",
    androidOutline,
  );
  const label = "w-[108px] shrink-0 text-[17px] android:w-auto android:text-[12px] android:leading-4 android:tracking-[0.4px] android:text-md-on-surface-variant android:group-focus-within/field:text-md-primary";
  const input = "min-w-0 flex-1 border-0 bg-transparent py-[11px] text-[17px] text-ios-label outline-none placeholder:text-ios-secondary android:py-1 android:text-[16px] android:leading-6 android:tracking-[0.5px] android:text-md-on-surface android:placeholder:text-md-on-surface-variant";

  return (
    // grid-cols-1 caps the column at the screen width (minmax(0, 1fr)). With an auto column, the widest
    // select's option text set the width and the form overflowed a 390px phone by 27px (found 2026-11-01).
    <form ref={formRef} noValidate onSubmit={submit} className="grid grid-cols-1 gap-7" aria-label={mode === "service" ? t.formService : t.formQuote}>
      <div role="radiogroup" aria-label={t.type} className="grid grid-cols-2 rounded-[9px] bg-ios-fill p-0.5 android:overflow-hidden android:rounded-full android:border android:border-md-outline android:bg-transparent android:p-0">
        {(["quote", "service"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={mode === option}
            onClick={() => {
              setMode(option);
              setErrors({});
            }}
            className={cn(
              "min-h-8 rounded-[7px] border-0 text-[13px] font-semibold transition-colors android:inline-flex android:min-h-10 android:items-center android:justify-center android:gap-2 android:rounded-none android:text-[14px] android:font-medium android:tracking-[0.1px] android:last:border-l android:last:border-md-outline",
              mode === option ? "bg-ios-cell text-ios-label shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] android:bg-md-secondary-container android:text-md-on-secondary-container android:shadow-none"
                : "bg-transparent text-ios-label android:text-md-on-surface",
            )}
          >
            {mode === option ? <Check className="hidden size-[18px] android:inline" aria-hidden="true" /> : null}
            {option === "quote" ? t.quote : t.service}
          </button>
        ))}
      </div>

      {mode === "quote" ? (
        <Group header={t.need} footer={groupErrors("category", "message")}>
          <div className="pl-4 android:p-4">
            <label className={cell}>
              <span className={label}>{t.category}</span>
              <span className="relative flex min-w-0 flex-1 items-center justify-end">
                <select name="category" value={fields.category} onChange={set("category")} className={cn(input, "appearance-none pr-6 text-right text-ios-secondary android:text-left android:text-md-on-surface")} {...describe("category")}>
                  {categoryOptions.map((option, index) => (
                    <option key={option} value={option}>
                      {t.categories[index] ?? option}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown className="pointer-events-none absolute right-0 size-4 text-ios-tertiary" aria-hidden="true" />
              </span>
            </label>
            <label className={cn("block py-2.5 pr-4 android:mb-3 android:px-4 android:py-3 android:last:mb-0", androidOutline)}>
              <span className="sr-only">{t.requirement}</span>
              <textarea
                name="message"
                rows={5}
                value={fields.message}
                onChange={set("message")}
                placeholder={t.requirementPlaceholder}
                className={cn(input, "w-full resize-none py-0 leading-[22px]")}
                {...describe("message")}
              />
            </label>
          </div>
        </Group>
      ) : (
        <>
          <Group header={t.serviceNeeded} footer={groupErrors("issue", "machine", "description")}>
            <div className="pl-4 android:p-4">
              <label className={cell}>
                <span className={label}>{t.problem}</span>
                <span className="relative flex min-w-0 flex-1 items-center justify-end">
                  <select name="issue" value={fields.issue} onChange={set("issue")} className={cn(input, "appearance-none pr-6 text-right text-ios-secondary android:text-left android:text-md-on-surface")}>
                    {serviceIssues.map((option, index) => (
                      <option key={option} value={option}>
                        {t.issues[index] ?? option}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="pointer-events-none absolute right-0 size-4 text-ios-tertiary" aria-hidden="true" />
                </span>
              </label>
              <label className={cell}>
                <span className={label}>{t.machine}</span>
                <input name="machine" value={fields.machine} onChange={set("machine")} placeholder={t.machinePlaceholder} className={input} enterKeyHint="next" />
              </label>
              <label className={cn("block py-2.5 pr-4 android:mb-3 android:px-4 android:py-3 android:last:mb-0", androidOutline)}>
                <span className="sr-only">{t.wrong}</span>
                <textarea
                  name="description"
                  rows={4}
                  value={fields.description}
                  onChange={set("description")}
                  placeholder={t.wrongPlaceholder}
                  className={cn(input, "w-full resize-none py-0 leading-[22px]")}
                  {...describe("description")}
                />
              </label>
            </div>
          </Group>

          <Group
            header={t.site}
            footer={
              errorText("siteAddress") ??
              (locating ? <span role="status">{locating}</span> : t.siteFooter)
            }
          >
            <div className="pl-4 android:p-4">
              <label className={cell}>
                <span className={label}>{t.address}</span>
                <input name="siteAddress" value={fields.siteAddress} onChange={set("siteAddress")} placeholder={t.addressPlaceholder} autoComplete="street-address" className={input} {...describe("siteAddress")} />
              </label>
              {pin ? (
                <div className={cn(cell, "android:flex-row android:items-center android:gap-3")}>
                  <MapPin className="size-5 shrink-0 text-ios-green" aria-hidden="true" />
                  <a href={pinLink(pin)} target="_blank" rel="noopener noreferrer" className="flex-1 py-[11px] text-[17px] text-ios-tint no-underline">
                    {t.pinAdded}{pin.accuracy ? ` · ±${Math.round(pin.accuracy)} m` : ""}
                  </a>
                  <button type="button" onClick={() => setPin(undefined)} aria-label={t.removePin} className="grid size-9 place-items-center rounded-full border-0 bg-transparent text-ios-secondary">
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={locate} className={cn(cell, "w-full border-x-0 border-t-0 bg-transparent text-left text-ios-tint android:min-h-12 android:flex-row android:items-center android:justify-center android:gap-2 android:rounded-full android:text-md-primary android:active:bg-md-primary/10")}>
                  {locating === t.finding ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <MapPin className="size-5" aria-hidden="true" />}
                  <span className="py-[11px] text-[17px]">{t.useLocation}</span>
                </button>
              )}
            </div>
          </Group>
        </>
      )}

      <Group header={t.details} footer={groupErrors("companyName", "contactPerson", "phone", "email") ?? t.detailsFooter}>
        <div className="pl-4 android:p-4">
          <label className={cell}>
            <span className={label}>{t.company}</span>
            <input name="companyName" value={fields.companyName} onChange={set("companyName")} autoComplete="organization" placeholder={t.required} className={input} enterKeyHint="next" {...describe("companyName")} />
          </label>
          <label className={cell}>
            <span className={label}>{t.name}</span>
            <input name="contactPerson" value={fields.contactPerson} onChange={set("contactPerson")} autoComplete="name" placeholder={t.required} className={input} enterKeyHint="next" {...describe("contactPerson")} />
          </label>
          <label className={cell}>
            <span className={label}>{t.phone}</span>
            <input name="phone" type="tel" inputMode="tel" value={fields.phone} onChange={set("phone")} autoComplete="tel" placeholder={t.required} className={input} enterKeyHint="next" {...describe("phone")} />
          </label>
          <label className={cell}>
            <span className={label}>{t.email}</span>
            <input name="email" type="email" inputMode="email" value={fields.email} onChange={set("email")} autoComplete="email" placeholder={t.optional} className={input} enterKeyHint="send" {...describe("email")} />
          </label>
        </div>
      </Group>

      {/* Hidden trap field: people never see or fill it, simple bots do. */}
      <input type="text" name="homepageUrl" value={fields.homepageUrl} onChange={set("homepageUrl")} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />

      {status.state === "error" ? (
        <p role="alert" className="m-0 rounded-[10px] bg-ios-red/12 px-4 py-3 text-[15px] leading-5 text-ios-red android:rounded-[12px] android:bg-md-error/12 android:text-[14px] android:text-md-error">
          {status.message}
        </p>
      ) : null}

      <div className="grid gap-3">
        <button
          type="submit"
          aria-disabled={status.state === "sending"}
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[14px] border-0 bg-ios-action text-[17px] font-semibold text-white active:opacity-80 aria-disabled:opacity-60 android:min-h-12 android:rounded-full android:text-[15px] android:font-medium android:tracking-[0.1px]"
        >
          {status.state === "sending" ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
          {status.state === "sending" ? t.sending : mode === "service" ? t.sendService : t.sendQuote}
        </button>
        {mode === "service" && pin && serviceWhatsapp ? (
          <a
            href={whatsappWithText(serviceWhatsapp, fill(t.pinMessage, { pin: pinLink(pin) }))}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[15px] text-ios-tint no-underline android:text-md-primary"
          >
            {t.pinWhatsapp}
          </a>
        ) : null}
      </div>
    </form>
  );
}
