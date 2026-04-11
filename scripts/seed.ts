import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
    // Skip if prediction with same title already exists
    const existing = await prisma.prediction.findFirst({
      where: { title: p.title },
    });
    if (existing) {
      console.log(`Skipped (already exists): ${p.title}`);
      continue;
    }

    const prediction = await prisma.prediction.create({
      data: {
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        visibility: "PUBLIC",
        resolutionDate: p.resolutionDate,
        owner: "seed-script",
        outcomes: {
          create: p.outcomes.map((o) => ({
            label: o.label,
            probability: o.probability,
            owner: "seed-script",
          })),
        },
      },
      include: { outcomes: true },
    });

    console.log(`Created prediction: ${prediction.title} (${prediction.id})`);
    for (const o of prediction.outcomes) {
      console.log(`  Created outcome: ${o.label} (${o.probability}%)`);
    }
    console.log();
  }

  console.log("Seed complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
