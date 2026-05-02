import type { Playbook } from "./types";
import { iranWarPlaybook } from "./iran-war";

const REGISTRY: Record<string, Playbook> = {
  [iranWarPlaybook.key]: iranWarPlaybook,
};

const CATEGORY_TO_KEY: Record<string, string> = {
  [iranWarPlaybook.category]: iranWarPlaybook.key,
};

export function getPlaybook(key: string): Playbook | null {
  return REGISTRY[key] ?? null;
}

export function getPlaybookForCategory(category: string): Playbook | null {
  const key = CATEGORY_TO_KEY[category.toLowerCase()];
  return key ? REGISTRY[key] : null;
}

export function listPlaybooks(): Playbook[] {
  return Object.values(REGISTRY);
}

export type { Playbook, PlaybookSource } from "./types";
