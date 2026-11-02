/**
 * The photo picker on the service, parts and warehouse forms, and how those forms send a lead with photos.
 * The browser checks count, size and type first so the visitor hears at once; the server checks again
 * (lib/leads/photos.ts), since anything sent can be forged.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { en } from "@/messages/en";
import { lo } from "@/messages/lo";

import { leadRequestInit, PhotoField } from "./photo-field";

const photo = (name: string, size = 1000, type = "image/jpeg") => new File([new Uint8Array(size)], name, { type });

function Harness({ labels = en.photoUpload }: { labels?: typeof en.photoUpload }) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  return <PhotoField id="test-photos" files={files} error={error} labels={labels} onChange={setFiles} onError={setError} />;
}

const choose = (files: File[]) => fireEvent.change(screen.getByLabelText(new RegExp(en.photoUpload.label)), { target: { files } });

describe("PhotoField", () => {
  it("lists the chosen photos and lets the visitor remove one", () => {
    render(<Harness />);
    choose([photo("nameplate.jpg"), photo("fault.png", 1000, "image/png")]);

    expect(screen.getByText("nameplate.jpg")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: new RegExp(en.photoUpload.remove) })[0]);
    expect(screen.queryByText("nameplate.jpg")).toBeNull();
    expect(screen.getByText("fault.png")).toBeTruthy();
  });

  it("refuses a third photo, an oversize photo and a non-photo file, with a message", () => {
    render(<Harness />);
    choose([photo("a.jpg"), photo("b.jpg"), photo("c.jpg")]);
    expect(screen.getByRole("alert").textContent).toBe(en.photoUpload.errors["too-many"]);

    choose([photo("big.jpg", 5 * 1024 * 1024 + 1)]);
    expect(screen.getByRole("alert").textContent).toBe(en.photoUpload.errors["too-large"]);

    choose([photo("drawing.svg", 100, "image/svg+xml")]);
    expect(screen.getByRole("alert").textContent).toBe(en.photoUpload.errors["wrong-type"]);
    expect(screen.queryByText("drawing.svg")).toBeNull();
  });

  it("speaks Lao on Lao pages", () => {
    render(<Harness labels={lo.photoUpload} />);
    expect(screen.getByText(lo.photoUpload.hint)).toBeTruthy();
  });
});

describe("leadRequestInit", () => {
  it("sends JSON when no photo is chosen", () => {
    const init = leadRequestInit({ a: 1 }, []);
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.body).toBe('{"a":1}');
  });

  it("sends a form with the lead as JSON and the photos when photos are chosen", () => {
    const init = leadRequestInit({ a: 1 }, [photo("a.jpg")]);
    const body = init.body as FormData;
    expect(init.headers).toBeUndefined(); // the browser sets the multipart boundary itself
    expect(body.get("lead")).toBe('{"a":1}');
    expect((body.getAll("photos")[0] as File).name).toBe("a.jpg");
  });
});
