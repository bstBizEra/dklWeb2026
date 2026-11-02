"use client";

import { type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import type { FieldError } from "react-hook-form";

import { Field } from "@/components/dklao/quote-request-form";
import { maxPhotoBytes, maxPhotos } from "@/lib/leads/photos-limits";
import type { Messages } from "@/messages/en";

// What the server accepts (lib/leads/photos.ts checks the bytes); here only the browser's declared type.

const accepted = ["image/jpeg", "image/png", "image/webp"];

type PhotoFieldProps = {
  id: string;
  files: File[];
  error: string;
  // getMessages(locale).photoUpload
  labels: Messages["photoUpload"];
  // The "(optional)" text in the page's language (quoteForm.optional).
  optional?: string;
  onChange: (files: File[]) => void;
  onError: (message: string) => void;
};

// Photos for the service, parts and warehouse forms. The browser checks count, size and type so the visitor
// hears at once; the server checks every file again from its bytes (lib/leads/photos.ts).
export function PhotoField({ id, files, error, labels: t, optional, onChange, onError }: PhotoFieldProps) {
  const add = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? []);
    // Clear the input so choosing the same file again after removing it still fires a change.
    event.target.value = "";
    const next = [...files, ...chosen];
    const problem =
      next.length > maxPhotos ? "too-many" : chosen.some((file) => file.size > maxPhotoBytes) ? "too-large" : chosen.some((file) => !accepted.includes(file.type)) ? "wrong-type" : null;
    if (problem) return onError(t.errors[problem]);
    onError("");
    onChange(next);
  };

  const fieldError: FieldError | undefined = error ? { type: "validate", message: error } : undefined;

  return (
    <Field id={id} label={t.label} error={fieldError} optional={optional} wide>
      <p id={`${id}-hint`} className="-mt-1 mb-0 text-[13px] leading-snug text-slate-600">
        {t.hint}
      </p>
      <label
        className="flex cursor-pointer items-center gap-2.5 rounded-button border border-dashed border-slate-400 bg-slate-50 px-3.5 py-3 text-[14px] font-[750] text-slate-700 focus-within:ring-2 focus-within:ring-ring hover:bg-slate-100"
      >
        <ImagePlus size={18} aria-hidden="true" />
        <span>{t.label}</span>
        <input
          id={id}
          type="file"
          multiple
          accept={accepted.join(",")}
          className="sr-only"
          aria-describedby={[`${id}-hint`, error ? `${id}-error` : ""].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          onChange={add}
        />
      </label>
      {files.length ? (
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-button bg-slate-100 px-3 py-2 text-[14px]">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`${t.remove} ${file.name}`}
                className="inline-flex items-center gap-1 text-[13px] font-[750] text-slate-600 hover:text-destructive"
                onClick={() => onChange(files.filter((_, other) => other !== index))}
              >
                <X size={14} aria-hidden="true" />
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}

// The fetch options for a lead: JSON as before, or a form carrying the lead as JSON plus the photos. The
// browser writes the multipart Content-Type with its boundary, so none is set here.
export function leadRequestInit(values: unknown, photos: File[]): RequestInit {
  if (!photos.length) return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) };
  const form = new FormData();
  form.set("lead", JSON.stringify(values));
  for (const photo of photos) form.append("photos", photo);
  return { method: "POST", body: form };
}
