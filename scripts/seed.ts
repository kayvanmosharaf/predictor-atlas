import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function sql(
  sqlStr: string,
  values?: unknown[]
) {
  const result = await pool.query(sqlStr, values);
  return result;
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
      `SELECT "id" FROM "Prediction" WHERE "title" = $1 LIMIT 1`,
      [p.title]
    );

    if (existing.rows.length > 0) {
      console.log(`Skipped (already exists): ${p.title}`);
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sql(
      `INSERT INTO "Prediction" ("id", "title", "description", "category", "status", "visibility", "resolutionDate", "owner", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'PUBLIC', $6, 'seed-script', $7, $7)`,
      [id, p.title, p.description, p.category, p.status, p.resolutionDate, now]
    );

    console.log(`Created prediction: ${p.title} (${id})`);

    for (const o of p.outcomes) {
      const oid = crypto.randomUUID();
      await sql(
        `INSERT INTO "Outcome" ("id", "predictionId", "label", "probability", "owner", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'seed-script', $5, $5)`,
        [oid, id, o.label, o.probability, now]
      );
      console.log(`  Created outcome: ${o.label} (${o.probability}%)`);
    }
    console.log();
  }

  console.log("Seed complete!");
  await pool.end();
}

seed().catch(console.error);
