/**
 * @jest-environment node
 */
import {
  getPlaybook,
  getPlaybookForCategory,
  listPlaybooks,
} from "@/lib/forecast/playbooks";

describe("playbook registry", () => {
  it("returns the iran-war playbook by key", () => {
    const pb = getPlaybook("iran-war");
    expect(pb).not.toBeNull();
    expect(pb?.label).toBe("Iran War Intelligence Model");
    expect(pb?.sources.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown key", () => {
    expect(getPlaybook("does-not-exist")).toBeNull();
  });

  it("looks up playbook by category (case-insensitive)", () => {
    const lower = getPlaybookForCategory("geopolitics");
    const upper = getPlaybookForCategory("GEOPOLITICS");
    const mixed = getPlaybookForCategory("Geopolitics");
    expect(lower?.key).toBe("iran-war");
    expect(upper?.key).toBe("iran-war");
    expect(mixed?.key).toBe("iran-war");
  });

  it("returns null when no playbook is registered for the category", () => {
    expect(getPlaybookForCategory("sports")).toBeNull();
  });

  it("listPlaybooks contains the iran-war playbook", () => {
    const all = listPlaybooks();
    expect(all.map((p) => p.key)).toContain("iran-war");
  });

  it("every source has positive weight and a description", () => {
    for (const pb of listPlaybooks()) {
      for (const s of pb.sources) {
        expect(s.weight).toBeGreaterThan(0);
        expect(s.description.length).toBeGreaterThan(0);
      }
    }
  });
});
