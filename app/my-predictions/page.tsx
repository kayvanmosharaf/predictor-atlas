"use client";

import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import AuthModal from "../components/AuthModal";
import PredictionForm from "../components/PredictionForm";
import styles from "./my-predictions.module.css";

const client = generateClient<Schema>();

type Prediction = Schema["Prediction"]["type"];
type Outcome = Schema["Outcome"]["type"];

interface PredictionWithOutcomes extends Prediction {
  outcomes: Outcome[];
}

const categoryColors: Record<string, string> = {
  POLITICS: "#ef4444",
  ECONOMICS: "#f59e0b",
  SPORTS: "#10b981",
  GEOPOLITICS: "#8b5cf6",
  TECHNOLOGY: "#3b82f6",
  OTHER: "#6b7280",
};

export default function MyPredictionsPage() {
  const { authStatus } = useAuthenticator();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [predictions, setPredictions] = useState<PredictionWithOutcomes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMyPredictions = async () => {
    try {
      const { data: predictionData } = await client.models.Prediction.list({
        authMode: "userPool",
      });
      const { data: outcomeData } = await client.models.Outcome.list({
        authMode: "userPool",
      });

      const grouped = predictionData.map((p) => ({
        ...p,
        outcomes: outcomeData.filter((o) => o.predictionId === p.id),
      }));

      setPredictions(grouped);
    } catch (err) {
      console.error("Failed to fetch predictions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchMyPredictions();
    } else {
      setLoading(false);
    }
  }, [authStatus]);

  const handleToggleVisibility = async (prediction: Prediction) => {
    setToggling(prediction.id);
    try {
      const newVisibility = prediction.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
      await client.models.Prediction.update(
        { id: prediction.id, visibility: newVisibility },
        { authMode: "userPool" }
      );
      setPredictions((prev) =>
        prev.map((p) =>
          p.id === prediction.id ? { ...p, visibility: newVisibility } : p
        )
      );
    } catch (err) {
      console.error("Failed to update visibility:", err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const prediction = predictions.find((p) => p.id === id);
      if (prediction) {
        for (const o of prediction.outcomes) {
          await client.models.Outcome.delete({ id: o.id }, { authMode: "userPool" });
        }
      }
      await client.models.Prediction.delete({ id }, { authMode: "userPool" });
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete prediction:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (authStatus !== "authenticated") {
    return (
      <div className={styles.page}>
        <div className={styles.signInState}>
          <h2>Sign in to create predictions</h2>
          <p>Create your own predictions, keep them private, or share them with the community.</p>
          <button className={styles.createBtn} onClick={() => setShowAuthModal(true)} style={{ marginTop: "1rem" }}>
            Sign In
          </button>
          {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>My Predictions</h1>
          <p>Create and manage your own predictions</p>
        </div>
        {!showForm && (
          <button className={styles.createBtn} onClick={() => setShowForm(true)}>
            + New Prediction
          </button>
        )}
      </header>

      {showForm && (
        <PredictionForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchMyPredictions();
          }}
        />
      )}

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading your predictions...</p>
      ) : predictions.length === 0 && !showForm ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t created any predictions yet.</p>
          <p>Click &quot;+ New Prediction&quot; to get started.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {predictions.map((prediction) => (
            <div key={prediction.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span
                    className={styles.categoryBadge}
                    style={{
                      backgroundColor: `${categoryColors[prediction.category ?? "OTHER"]}20`,
                      color: categoryColors[prediction.category ?? "OTHER"],
                    }}
                  >
                    {prediction.category}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      prediction.visibility === "PUBLIC"
                        ? styles.publicBadge
                        : styles.privateBadge
                    }`}
                  >
                    {prediction.visibility ?? "PRIVATE"}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 500 }}>
                  {prediction.status}
                </span>
              </div>

              <h2 className={styles.cardTitle}>{prediction.title}</h2>
              <p className={styles.cardDesc}>{prediction.description}</p>

              <div className={styles.outcomes}>
                {prediction.outcomes.map((outcome) => (
                  <div key={outcome.id} className={styles.outcome}>
                    <div className={styles.outcomeHeader}>
                      <span>{outcome.label}</span>
                      <span className={styles.probability}>{outcome.probability ?? 0}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${outcome.probability ?? 0}%`,
                          backgroundColor: categoryColors[prediction.category ?? "OTHER"],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <span>
                  {prediction.resolutionDate
                    ? `Resolves: ${prediction.resolutionDate}`
                    : "No resolution date"}
                </span>
                <div className={styles.cardActions}>
                  <button
                    className={
                      prediction.visibility === "PUBLIC"
                        ? styles.unshareBtn
                        : styles.shareBtn
                    }
                    onClick={() => handleToggleVisibility(prediction)}
                    disabled={toggling === prediction.id}
                  >
                    {toggling === prediction.id
                      ? "..."
                      : prediction.visibility === "PUBLIC"
                      ? "Make Private"
                      : "Share"}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(prediction.id)}
                    disabled={deleting === prediction.id}
                  >
                    {deleting === prediction.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
