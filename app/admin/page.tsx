"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAdmin } from "../hooks/useAdmin";
import PredictionForm from "../components/PredictionForm";
import styles from "./admin.module.css";

const client = generateClient<Schema>();

type Prediction = Schema["Prediction"]["type"];

const seedPredictions = [
  {
    title: "2026 US Midterm Elections",
    category: "POLITICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
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
    visibility: "PUBLIC" as const,
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
    visibility: "PUBLIC" as const,
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
    visibility: "PUBLIC" as const,
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
    visibility: "PUBLIC" as const,
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
    visibility: "PUBLIC" as const,
    description:
      "Will the US adopt EU-style AI regulation or diverge? Strategic analysis of industry lobbying, public pressure, and international competition dynamics.",
    outcomes: [
      { label: "US converges with EU", probability: 20 },
      { label: "US diverges", probability: 45 },
      { label: "Partial alignment", probability: 35 },
    ],
    resolutionDate: "2027-06-30",
  },
  {
    title: "2026 FIFA World Cup Qualifying — CONCACAF",
    category: "SPORTS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "Which CONCACAF teams will qualify for the 2026 FIFA World Cup? Analysis of squad depth, home-field advantage, and strategic rest patterns across the qualifying campaign.",
    outcomes: [
      { label: "USA qualifies directly", probability: 85 },
      { label: "USA via playoff", probability: 10 },
      { label: "USA fails to qualify", probability: 5 },
    ],
    resolutionDate: "2026-06-01",
  },
  {
    title: "Federal Reserve Rate Cuts by End of 2026",
    category: "ECONOMICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "How many basis points will the Fed cut by December 2026? Game theory analysis of inflation expectations, labor market signals, and central bank signaling strategies.",
    outcomes: [
      { label: "0-50 bps (hawkish hold)", probability: 25 },
      { label: "75-150 bps (moderate easing)", probability: 45 },
      { label: "200+ bps (aggressive cuts)", probability: 30 },
    ],
    resolutionDate: "2026-12-31",
  },
  {
    title: "Taiwan Strait Crisis Escalation",
    category: "GEOPOLITICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "Will tensions in the Taiwan Strait escalate to a military blockade or conflict by 2028? Strategic analysis of deterrence credibility, alliance commitments, and economic interdependence.",
    outcomes: [
      { label: "Military confrontation", probability: 10 },
      { label: "Naval blockade or quarantine", probability: 15 },
      { label: "Heightened tensions, no action", probability: 50 },
      { label: "De-escalation", probability: 25 },
    ],
    resolutionDate: "2028-01-01",
  },
  {
    title: "Global Adoption of Central Bank Digital Currencies",
    category: "ECONOMICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "How many G20 nations will have a live retail CBDC by 2028? Analysis of monetary policy incentives, privacy trade-offs, and competitive dynamics between central banks.",
    outcomes: [
      { label: "0-3 countries", probability: 20 },
      { label: "4-8 countries", probability: 45 },
      { label: "9+ countries", probability: 35 },
    ],
    resolutionDate: "2028-01-01",
  },
  {
    title: "SpaceX Starship Crewed Mars Mission by 2030",
    category: "TECHNOLOGY" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "Will SpaceX launch a crewed mission to Mars by 2030? Strategic analysis of technical milestones, funding dynamics, regulatory hurdles, and competition with NASA Artemis.",
    outcomes: [
      { label: "Crewed launch by 2030", probability: 10 },
      { label: "Uncrewed cargo only", probability: 35 },
      { label: "Significant delays past 2030", probability: 55 },
    ],
    resolutionDate: "2030-12-31",
  },
  {
    title: "2028 US Presidential Election",
    category: "POLITICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "Which party will win the 2028 US presidential election? Game theory analysis of primary dynamics, coalition building, swing state strategies, and demographic shifts.",
    outcomes: [
      { label: "Republican wins", probability: 45 },
      { label: "Democrat wins", probability: 50 },
      { label: "Third party wins", probability: 5 },
    ],
    resolutionDate: "2028-11-05",
  },
  {
    title: "Artificial General Intelligence Timeline",
    category: "TECHNOLOGY" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "When will a system broadly recognized as AGI be demonstrated? Analysis of compute scaling laws, research breakthroughs, safety constraints, and competitive dynamics among AI labs.",
    outcomes: [
      { label: "Before 2028", probability: 15 },
      { label: "2028-2032", probability: 40 },
      { label: "2033-2040", probability: 30 },
      { label: "After 2040 or never", probability: 15 },
    ],
    resolutionDate: "2040-12-31",
  },
  {
    title: "Ukraine-Russia Conflict Resolution",
    category: "GEOPOLITICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "How will the Ukraine-Russia conflict resolve? Nash equilibrium analysis of territorial concessions, sanctions leverage, alliance fatigue, and domestic political pressures.",
    outcomes: [
      { label: "Negotiated settlement", probability: 35 },
      { label: "Frozen conflict", probability: 40 },
      { label: "Ukrainian full recovery", probability: 10 },
      { label: "Russian escalation", probability: 15 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    title: "Global Electric Vehicle Market Share 2027",
    category: "ECONOMICS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "What share of new car sales globally will be fully electric by 2027? Analysis of battery cost curves, charging infrastructure investment, government subsidies, and consumer adoption dynamics.",
    outcomes: [
      { label: "Under 20%", probability: 20 },
      { label: "20-30%", probability: 40 },
      { label: "30-40%", probability: 30 },
      { label: "Over 40%", probability: 10 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    title: "Premier League 2026-27 Champion",
    category: "SPORTS" as const,
    status: "OPEN" as const,
    visibility: "PUBLIC" as const,
    description:
      "Which club will win the 2026-27 Premier League title? Game theory analysis of squad investment strategies, managerial tactics, fixture congestion, and transfer market dynamics.",
    outcomes: [
      { label: "Manchester City", probability: 30 },
      { label: "Arsenal", probability: 30 },
      { label: "Liverpool", probability: 20 },
      { label: "Other club", probability: 20 },
    ],
    resolutionDate: "2027-05-31",
  },
];

interface SeedPrediction {
  title: string;
  category: string;
  status: string;
  visibility: string;
  description: string;
  outcomes: { label: string; probability: number }[];
  resolutionDate?: string;
}

export default function AdminPage() {
  const { authStatus } = useAuthenticator();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");
  const [seedError, setSeedError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPredictions = async () => {
    try {
      const { data } = await client.models.Prediction.list({
        authMode: "userPool",
      });
      setPredictions(data);
    } catch (err) {
      console.error("Failed to fetch predictions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated" && isAdmin) {
      fetchPredictions();
    }
  }, [authStatus, isAdmin]);

  const seedFromData = async (data: SeedPrediction[]) => {
    const { data: existing } = await client.models.Prediction.list({
      authMode: "userPool",
    });
    const existingTitles = new Set(existing.map((p) => p.title));

    let created = 0;
    let skipped = 0;

    for (const p of data) {
      if (existingTitles.has(p.title)) {
        skipped++;
        continue;
      }

      const { outcomes, ...predictionData } = p;
      const { data: prediction, errors } =
        await client.models.Prediction.create(
          {
            ...predictionData,
            category: predictionData.category as "POLITICS" | "ECONOMICS" | "SPORTS" | "GEOPOLITICS" | "TECHNOLOGY" | "OTHER",
            status: (predictionData.status as "OPEN" | "CLOSED" | "RESOLVED") || "OPEN",
            visibility: (predictionData.visibility as "PRIVATE" | "PUBLIC") || "PUBLIC",
          },
          { authMode: "userPool" }
        );

      if (errors || !prediction) {
        console.error(`Failed to create "${p.title}":`, errors);
        continue;
      }

      for (const o of outcomes) {
        await client.models.Outcome.create(
          {
            predictionId: prediction.id,
            label: o.label,
            probability: o.probability,
          },
          { authMode: "userPool" }
        );
      }
      created++;
    }

    return { created, skipped };
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedStatus("");
    setSeedError("");

    try {
      const { created, skipped } = await seedFromData(seedPredictions);
      setSeedStatus(
        `Seeded ${created} prediction(s)${skipped > 0 ? `, skipped ${skipped} duplicate(s)` : ""}.`
      );
      await fetchPredictions();
    } catch (err) {
      console.error("Seed failed:", err);
      setSeedError("Seed failed. Check console for details.");
    } finally {
      setSeeding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("");
    setUploadError("");
    setSeeding(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text) as SeedPrediction[];

      if (!Array.isArray(data)) {
        throw new Error("File must contain a JSON array of predictions.");
      }

      for (const item of data) {
        if (!item.title || !item.description || !Array.isArray(item.outcomes)) {
          throw new Error(
            "Each prediction must have title, description, and outcomes array."
          );
        }
      }

      const { created, skipped } = await seedFromData(data);
      setUploadStatus(
        `Uploaded ${created} prediction(s) from file${skipped > 0 ? `, skipped ${skipped} duplicate(s)` : ""}.`
      );
      await fetchPredictions();
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadError(
        err instanceof Error ? err.message : "Failed to parse file."
      );
    } finally {
      setSeeding(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { data: outcomes } = await client.models.Outcome.list({
        authMode: "userPool",
      });
      const related = outcomes.filter((o) => o.predictionId === id);
      for (const o of related) {
        await client.models.Outcome.delete({ id: o.id }, { authMode: "userPool" });
      }

      await client.models.Prediction.delete({ id }, { authMode: "userPool" });
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (adminLoading) {
    return (
      <div className={styles.page}>
        <p style={{ color: "#64748b" }}>Checking permissions...</p>
      </div>
    );
  }

  if (authStatus !== "authenticated" || !isAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.unauthorized}>
          <h2>Access Denied</h2>
          <p>You must be signed in as an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Admin</h1>
        <p>Manage predictions and seed data</p>
      </header>

      <section className={styles.section}>
        <h2>Seed Data</h2>
        <div className={styles.seedBar}>
          <button
            className={styles.seedBtn}
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? "Seeding..." : "Seed Built-in Predictions"}
          </button>
          <span className={styles.seedDivider}>or</span>
          <label className={styles.uploadBtn}>
            Upload JSON File
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={seeding}
              hidden
            />
          </label>
        </div>
        {seedStatus && <span className={styles.seedStatus}>{seedStatus}</span>}
        {seedError && <span className={styles.seedError}>{seedError}</span>}
        {uploadStatus && <span className={styles.seedStatus}>{uploadStatus}</span>}
        {uploadError && <span className={styles.seedError}>{uploadError}</span>}
        <div className={styles.fileHint}>
          <p>
            JSON format: an array of objects with <code>title</code>, <code>description</code>,{" "}
            <code>category</code>, <code>outcomes</code> (each with <code>label</code> and{" "}
            <code>probability</code>), and optionally <code>resolutionDate</code>.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Add Prediction</h2>
          {!showForm && (
            <button
              className={styles.seedBtn}
              onClick={() => setShowForm(true)}
            >
              + New Prediction
            </button>
          )}
        </div>
        {showForm && (
          <PredictionForm
            onCancel={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              fetchPredictions();
            }}
            defaultVisibility="PUBLIC"
            showVisibilityToggle
          />
        )}
      </section>

      <section className={styles.section}>
        <h2>All Predictions ({predictions.length})</h2>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading...</p>
        ) : predictions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No predictions yet. Use the seed button above to get started.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{p.status}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.visibility === "PUBLIC"
                          ? styles.publicBadge
                          : styles.privateBadge
                      }`}
                    >
                      {p.visibility ?? "PUBLIC"}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    {p.owner ?? "system"}
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
