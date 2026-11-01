/**
 * Role rules for the CMS: owner sees everything, editor never sees customer data,
 * advisor reads leads but cannot manage users, and nobody writes leads through the public REST API.
 */
import { describe, expect, it } from "vitest";

import { Articles } from "./collections/articles";
import { Leads } from "./collections/leads";
import { Pages } from "./collections/pages";
import { Users } from "./collections/users";
import { SiteFacts } from "./globals/site-facts";
import { isOwner, isOwnerOrAdvisor, isOwnerOrEditor, never, ownerOrSelf, roles } from "./access";

const as = (role?: string, id = 1) => ({ req: { user: role ? { id, role } : null } }) as never;

describe("cms roles", () => {
  it("defines exactly three roles", () => {
    expect(roles).toEqual(["owner", "editor", "advisor"]);
  });

  it("limits leads to owner and advisor, and public create to nobody", () => {
    expect(isOwnerOrAdvisor(as("owner"))).toBe(true);
    expect(isOwnerOrAdvisor(as("advisor"))).toBe(true);
    expect(isOwnerOrAdvisor(as("editor"))).toBe(false);
    expect(isOwnerOrAdvisor(as())).toBe(false);
    expect(Leads.access?.create).toBe(never);
    expect(Leads.access?.read).toBe(isOwnerOrAdvisor);
    expect(Leads.access?.delete).toBe(isOwner);
  });

  it("lets only the owner manage users, and others read only themselves", () => {
    expect(Users.access?.create).toBe(isOwner);
    expect(Users.access?.delete).toBe(isOwner);
    // Payload's default lets any logged-in user unlock any account.
    expect(Users.access?.unlock).toBe(isOwner);
    expect(ownerOrSelf(as("owner"))).toBe(true);
    expect(ownerOrSelf(as("editor", 7))).toEqual({ id: { equals: 7 } });
    expect(ownerOrSelf(as())).toBe(false);
  });

  it("lets editors work on content but not customer data", () => {
    expect(isOwnerOrEditor(as("editor"))).toBe(true);
    expect(isOwnerOrEditor(as("advisor"))).toBe(false);
  });

  it("locks an account only after more failed logins than one address may send in the window", () => {
    // The per-address throttle (lib/auth/throttle.ts) allows 10 attempts per 15 minutes.
    expect(Users.auth).toMatchObject({ maxLoginAttempts: 20, lockTime: 15 * 60 * 1000 });
  });

  it("shows page and article drafts and history only to owners and editors", () => {
    // Unset, Payload lets any logged-in user read versions, which put unpublished drafts in front of advisors.
    for (const collection of [Pages, Articles]) {
      expect(collection.access?.readVersions, collection.slug).toBe(isOwnerOrEditor);
    }
    expect(isOwnerOrEditor(as("advisor"))).toBe(false);
  });

  it("keeps site facts public to read and owner-only to change", () => {
    expect(SiteFacts.access?.update).toBe(isOwner);
    const names = (SiteFacts.fields as { name: string }[]).map((field) => field.name);
    expect(names).toEqual(expect.arrayContaining(["phone", "whatsapp", "facebook", "email", "brands"]));
  });
});
