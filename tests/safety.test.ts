import { describe, expect, it } from "vitest";
import { scanBrief } from "../app/lib/safety";

function kinds(text: string): string[] {
  return scanBrief(text).map((w) => w.kind);
}

describe("scanBrief — flags real-looking details", () => {
  it("flags a real email address", () => {
    expect(kinds("Please reach me at jane.doe@gmail.com today")).toContain("email");
  });

  it("flags a real-looking phone number", () => {
    expect(kinds("Call the owner on 0412 345 678 after 5pm")).toContain("phone");
  });

  it("flags an international-format phone number", () => {
    expect(kinds("Mobile is +61 412 345 678")).toContain("phone");
  });

  it("flags sensitive identifiers", () => {
    expect(kinds("His TFN is on file")).toContain("sensitive-id");
    expect(kinds("Medicare card supplied")).toContain("sensitive-id");
  });

  it("flags credential / financial keywords", () => {
    expect(kinds("the wifi password is hunter2")).toContain("credential");
    expect(kinds("store the API key in env")).toContain("credential");
  });
});

describe("scanBrief — does not flag the app's safe sample values", () => {
  it("does not flag the reserved @example.com domain", () => {
    expect(kinds("Sample contact jane@example.com")).not.toContain("email");
  });

  it("does not flag reserved fictional phone ranges", () => {
    const warnings = kinds("Mobile 0491 570 156 or landline (02) 5550 0001");
    expect(warnings).not.toContain("phone");
  });

  it("does not flag ordinary ISO dates as phone numbers", () => {
    expect(kinds("Job scheduled for 2026-04-28")).not.toContain("phone");
  });

  it("returns no warnings for clean sample text", () => {
    expect(scanBrief("A friendly dog walking business taking weekly bookings.")).toEqual([]);
  });

  it("handles empty input safely", () => {
    expect(scanBrief("")).toEqual([]);
  });
});
