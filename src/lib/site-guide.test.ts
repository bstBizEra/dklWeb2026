import { describe, expect, it } from "vitest";
import { answerSiteQuestion } from "./site-guide";

describe("public site guide", () => {
  it("routes service questions to service without claiming availability", () => {
    expect(answerSiteQuestion("My forklift is broken").href).toBe("/maintenance-service");
    expect(answerSiteQuestion("What is the rental price and stock?").text).toContain("can't confirm");
  });
});
