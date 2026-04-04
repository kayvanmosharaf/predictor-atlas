import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>({ authMode: "apiKey" });

const seedPredictions = [
  {
    title: "2026 US Midterm Elections",
    category: "POLITICS" as const,
    status: "OPEN" as const,
    description:
      "Which party will control the House after the 2026 midterms? Game theory analysis of campaign strategies, voter turnout models, and redistricting effects.",
    outcomes: [
      { label: "Democrats retain", probability: 45 },
      { label: "Republicans gain", probability: 55 },
    ],
    resolutionDate: "2026-11-03",
  },
  {
    title: "Global Recession Probability 2026-2027",
    category: "ECONOMICS" as const,
    status: "OPEN" as const,
    description:
      "Will major economies enter recession by end of 2027? Strategic analysis of central bank policies, trade dynamics, and fiscal responses.",
    outcomes: [
      { label: "Recession occurs", probability: 30 },
      { label: "Soft landing", probability: 45 },
      { label: "Continued growth", probability: 25 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    title: "NBA Finals 2026 Champion",
    category: "SPORTS" as const,
    status: "OPEN" as const,
    description:
      "Predicting the 2026 NBA champion using game theory models of playoff matchups, coaching strategies, and player interactions.",
    outcomes: [
      { label: "Eastern Conference team", probability: 40 },
      { label: "Western Conference team", probability: 60 },
    ],
    resolutionDate: "2026-06-30",
  },
  {
    title: "EU-China Trade Negotiations Outcome",
    category: "GEOPOLITICS" as const,
    status: "OPEN" as const,
    description:
      "How will EU-China trade negotiations resolve? Nash equilibrium analysis of tariff strategies, market access demands, and diplomatic leverage.",
    outcomes: [
      { label: "Mutual concessions", probability: 35 },
      { label: "Trade escalation", probability: 40 },
      { label: "Status quo", probability: 25 },
    ],
    resolutionDate: "2026-12-31",
  },
  {
    title: "US-Iran Military Conflict Probability",
    category: "GEOPOLITICS" as const,
    status: "OPEN" as const,
    description:
      "What is the likelihood of a direct US-Iran military confrontation by 2027? Game theory analysis of escalation dynamics, nuclear negotiations, proxy conflicts, and strategic deterrence models.",
    outcomes: [
      { label: "Direct conflict", probability: 15 },
      { label: "Proxy escalation only", probability: 35 },
      { label: "Diplomatic resolution", probability: 20 },
      { label: "Status quo tensions", probability: 30 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    title: "AI Regulation Framework — US vs EU",
    category: "TECHNOLOGY" as const,
    status: "OPEN" as const,
    description:
      "Will the US adopt EU-style AI regulation or diverge? Strategic analysis of industry lobbying, public pressure, and international competition dynamics.",
    outcomes: [
      { label: "US converges with EU", probability: 20 },
      { label: "US diverges", probability: 45 },
      { label: "Partial alignment", probability: 35 },
    ],
    resolutionDate: "2027-06-30",
  },
];

async function seed() {
  console.log("Seeding predictions and outcomes...\n");

  for (const p of seedPredictions) {
    const { outcomes, ...predictionData } = p;

    const { data: prediction, errors } = await client.models.Prediction.create(predictionData);
    if (errors || !prediction) {
      console.error(`Failed to create prediction "${p.title}":`, errors);
      continue;
    }
    console.log(`Created prediction: ${prediction.title} (${prediction.id})`);

    for (const o of outcomes) {
      const { data: outcome, errors: oErrors } = await client.models.Outcome.create({
        predictionId: prediction.id,
        label: o.label,
        probability: o.probability,
      });
      if (oErrors || !outcome) {
        console.error(`  Failed to create outcome "${o.label}":`, oErrors);
        continue;
      }
      console.log(`  Created outcome: ${outcome.label} (${outcome.probability}%)`);
    }
    console.log();
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
