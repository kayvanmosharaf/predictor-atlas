import type { Playbook } from "./types";

export const iranWarPlaybook: Playbook = {
  key: "iran-war",
  category: "geopolitics",
  label: "Iran War Intelligence Model",
  systemContext: `You are analyzing the Iran War (Operation Epic Fury, started 2026-02-28).
Scenarios under consideration: S1 Negotiated Deal, S2 Managed Attrition, S3 Yanbu/Recession,
S4 Regime Collapse, S5 Ground War, S6 Frozen Conflict, S8 Regional War. Track market signals
(Brent, AAA gas, S&P 500), the Trump narrative state (N1-N5), and early warning triggers.`,
  sources: [
    {
      name: "AAA Gas Prices",
      description: "US national average gasoline price (current, week-ago, month-ago).",
      weight: 1.0,
      searchHints: ["AAA gas prices today national average", "site:gasprices.aaa.com"],
    },
    {
      name: "Brent Crude",
      description: "Latest Brent crude spot price and direction.",
      weight: 1.2,
      searchHints: ["Brent crude price today", "Brent oil futures latest"],
    },
    {
      name: "Trump Truth Social",
      description: "Last 24 hours of Trump statements on Iran for narrative-state classification (N1-N5).",
      weight: 1.5,
      searchHints: ["Trump Truth Social Iran statements last 24 hours"],
    },
    {
      name: "Iran FM Araghchi",
      description: "Iranian Foreign Minister statements and Tehran's diplomatic posture.",
      weight: 1.2,
      searchHints: ["Iran foreign minister Araghchi statement today"],
    },
    {
      name: "NetBlocks Iran",
      description: "Iran internet connectivity level (Trigger 6 monitor).",
      weight: 1.0,
      searchHints: ["NetBlocks Iran internet connectivity today"],
    },
  ],
  modelTemplate: "dual-framework-bayesian",
  criticChecklist: [
    "Probabilities sum to ~100",
    "Narrative state is consistent with cited Trump statements",
    "Brent direction agrees with scenario shift",
    "Each evidence item has at least one citation",
  ],
};
