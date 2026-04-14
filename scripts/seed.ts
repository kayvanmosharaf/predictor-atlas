import {
  RDSDataClient,
  ExecuteStatementCommand,
} from "@aws-sdk/client-rds-data";
import "dotenv/config";

const client = new RDSDataClient({ region: process.env.AWS_REGION || "us-east-2" });
const resourceArn = process.env.AURORA_CLUSTER_ARN!;
const secretArn = process.env.AURORA_SECRET_ARN!;
const database = "predictoratlas";

async function sql(
  sqlStr: string,
  parameters?: { name: string; value: Record<string, unknown> }[]
) {
  const command = new ExecuteStatementCommand({
    resourceArn,
    secretArn,
    database,
    sql: sqlStr,
    parameters: parameters as ExecuteStatementCommand["input"]["parameters"],
    includeResultMetadata: true,
  });
  return client.send(command);
}

const seedPredictions = [
  {
    title: "2026 US Midterm Elections",
    category: "POLITICS",
    status: "OPEN",
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
    category: "ECONOMICS",
    status: "OPEN",
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
    category: "SPORTS",
    status: "OPEN",
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
    category: "GEOPOLITICS",
    status: "OPEN",
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
    category: "GEOPOLITICS",
    status: "OPEN",
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
    category: "TECHNOLOGY",
    status: "OPEN",
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
    // Check if prediction with same title already exists
    const existing = await sql(
      `SELECT "id" FROM "Prediction" WHERE "title" = :title LIMIT 1`,
      [{ name: "title", value: { stringValue: p.title } }]
    );

    if (existing.records && existing.records.length > 0) {
      console.log(`Skipped (already exists): ${p.title}`);
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sql(
      `INSERT INTO "Prediction" ("id", "title", "description", "category", "status", "visibility", "resolutionDate", "owner", "createdAt", "updatedAt")
       VALUES (:id, :title, :description, :category, :status, 'PUBLIC', :resolutionDate, 'seed-script', :now, :now)`,
      [
        { name: "id", value: { stringValue: id } },
        { name: "title", value: { stringValue: p.title } },
        { name: "description", value: { stringValue: p.description } },
        { name: "category", value: { stringValue: p.category } },
        { name: "status", value: { stringValue: p.status } },
        { name: "resolutionDate", value: { stringValue: p.resolutionDate } },
        { name: "now", value: { stringValue: now } },
      ]
    );

    console.log(`Created prediction: ${p.title} (${id})`);

    for (const o of p.outcomes) {
      const oid = crypto.randomUUID();
      await sql(
        `INSERT INTO "Outcome" ("id", "predictionId", "label", "probability", "owner", "createdAt", "updatedAt")
         VALUES (:id, :predictionId, :label, :probability, 'seed-script', :now, :now)`,
        [
          { name: "id", value: { stringValue: oid } },
          { name: "predictionId", value: { stringValue: id } },
          { name: "label", value: { stringValue: o.label } },
          { name: "probability", value: { doubleValue: o.probability } },
          { name: "now", value: { stringValue: now } },
        ]
      );
      console.log(`  Created outcome: ${o.label} (${o.probability}%)`);
    }
    console.log();
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
