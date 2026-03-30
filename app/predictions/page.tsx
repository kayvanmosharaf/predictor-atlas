"use client";

import styles from "./predictions.module.css";

const samplePredictions = [
  {
    id: "1",
    title: "2026 US Midterm Elections",
    category: "POLITICS",
    status: "OPEN",
    description:
      "Which party will control the House after the 2026 midterms? Game theory analysis of campaign strategies, voter turnout models, and redistricting effects.",
    outcomes: [
      { name: "Democrats retain", probability: 45 },
      { name: "Republicans gain", probability: 55 },
    ],
    resolutionDate: "2026-11-03",
  },
  {
    id: "2",
    title: "Global Recession Probability 2026-2027",
    category: "ECONOMICS",
    status: "OPEN",
    description:
      "Will major economies enter recession by end of 2027? Strategic analysis of central bank policies, trade dynamics, and fiscal responses.",
    outcomes: [
      { name: "Recession occurs", probability: 30 },
      { name: "Soft landing", probability: 45 },
      { name: "Continued growth", probability: 25 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    id: "3",
    title: "NBA Finals 2026 Champion",
    category: "SPORTS",
    status: "OPEN",
    description:
      "Predicting the 2026 NBA champion using game theory models of playoff matchups, coaching strategies, and player interactions.",
    outcomes: [
      { name: "Eastern Conference team", probability: 40 },
      { name: "Western Conference team", probability: 60 },
    ],
    resolutionDate: "2026-06-30",
  },
  {
    id: "4",
    title: "EU-China Trade Negotiations Outcome",
    category: "GEOPOLITICS",
    status: "OPEN",
    description:
      "How will EU-China trade negotiations resolve? Nash equilibrium analysis of tariff strategies, market access demands, and diplomatic leverage.",
    outcomes: [
      { name: "Mutual concessions", probability: 35 },
      { name: "Trade escalation", probability: 40 },
      { name: "Status quo", probability: 25 },
    ],
    resolutionDate: "2026-12-31",
  },
  {
    id: "5",
    title: "US-Iran Military Conflict Probability",
    category: "GEOPOLITICS",
    status: "OPEN",
    description:
      "What is the likelihood of a direct US-Iran military confrontation by 2027? Game theory analysis of escalation dynamics, nuclear negotiations, proxy conflicts, and strategic deterrence models.",
    outcomes: [
      { name: "Direct conflict", probability: 15 },
      { name: "Proxy escalation only", probability: 35 },
      { name: "Diplomatic resolution", probability: 20 },
      { name: "Status quo tensions", probability: 30 },
    ],
    resolutionDate: "2027-12-31",
  },
  {
    id: "6",
    title: "AI Regulation Framework — US vs EU",
    category: "TECHNOLOGY",
    status: "OPEN",
    description:
      "Will the US adopt EU-style AI regulation or diverge? Strategic analysis of industry lobbying, public pressure, and international competition dynamics.",
    outcomes: [
      { name: "US converges with EU", probability: 20 },
      { name: "US diverges", probability: 45 },
      { name: "Partial alignment", probability: 35 },
    ],
    resolutionDate: "2027-06-30",
  },
];

const categoryColors: Record<string, string> = {
  POLITICS: "#ef4444",
  ECONOMICS: "#f59e0b",
  SPORTS: "#10b981",
  GEOPOLITICS: "#8b5cf6",
  TECHNOLOGY: "#3b82f6",
  OTHER: "#6b7280",
};

export default function PredictionsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Active Predictions</h1>
        <p>Browse open predictions and submit your forecasts</p>
      </header>

      <div className={styles.filters}>
        {["All", "Politics", "Economics", "Sports", "Geopolitics", "Technology"].map(
          (filter) => (
            <button key={filter} className={styles.filterBtn}>
              {filter}
            </button>
          )
        )}
      </div>

      <div className={styles.grid}>
        {samplePredictions.map((prediction) => (
          <div key={prediction.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span
                className={styles.badge}
                style={{
                  backgroundColor: `${categoryColors[prediction.category]}20`,
                  color: categoryColors[prediction.category],
                }}
              >
                {prediction.category}
              </span>
              <span className={styles.status}>{prediction.status}</span>
            </div>
            <h2 className={styles.cardTitle}>{prediction.title}</h2>
            <p className={styles.cardDesc}>{prediction.description}</p>
            <div className={styles.outcomes}>
              {prediction.outcomes.map((outcome) => (
                <div key={outcome.name} className={styles.outcome}>
                  <div className={styles.outcomeHeader}>
                    <span>{outcome.name}</span>
                    <span className={styles.probability}>{outcome.probability}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${outcome.probability}%`,
                        backgroundColor: categoryColors[prediction.category],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.cardFooter}>
              <span>Resolves: {prediction.resolutionDate}</span>
              <button className={styles.forecastBtn}>Make Forecast</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
