"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import AuthModal from "../components/AuthModal";
import styles from "./predictions.module.css";

const client = generateClient<Schema>();

type Prediction = Schema["Prediction"]["type"];
type Outcome = Schema["Outcome"]["type"];
type Forecast = Schema["Forecast"]["type"];

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

export default function PredictionsPage() {
  const { authStatus } = useAuthenticator();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeForecast, setActiveForecast] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<Record<string, Record<string, number>>>({});
  const [predictions, setPredictions] = useState<PredictionWithOutcomes[]>([]);
  const [userForecasts, setUserForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch predictions and their outcomes
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: predictionData } = await client.models.Prediction.list();
        const { data: outcomeData } = await client.models.Outcome.list();

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
    }
    fetchData();
  }, []);

  // Fetch user's existing forecasts when authenticated
  const loadUserForecasts = useCallback(async () => {
    if (authStatus !== "authenticated") {
      setUserForecasts([]);
      return;
    }
    try {
      const { data } = await client.models.Forecast.list({
        authMode: "userPool",
      });
      setUserForecasts(data);

      // Pre-fill slider values from existing forecasts
      const existing: Record<string, Record<string, number>> = {};
      for (const f of data) {
        const outcome = predictions
          .flatMap((p) => p.outcomes)
          .find((o) => o.id === f.outcomeId);
        if (outcome) {
          if (!existing[f.predictionId]) existing[f.predictionId] = {};
          existing[f.predictionId][outcome.label] = f.confidence;
        }
      }
      setForecasts((prev) => ({ ...prev, ...existing }));
    } catch (err) {
      console.error("Failed to fetch user forecasts:", err);
    }
  }, [authStatus, predictions]);

  useEffect(() => {
    if (predictions.length > 0) {
      loadUserForecasts();
    }
  }, [predictions, loadUserForecasts]);

  const handleMakeForecast = (predictionId: string) => {
    if (authStatus !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    setActiveForecast(activeForecast === predictionId ? null : predictionId);
  };

  const handleSliderChange = (predictionId: string, outcomeLabel: string, value: number) => {
    setForecasts((prev) => ({
      ...prev,
      [predictionId]: {
        ...prev[predictionId],
        [outcomeLabel]: value,
      },
    }));
  };

  const getForecastValue = (predictionId: string, outcomeLabel: string, defaultProb: number) => {
    return forecasts[predictionId]?.[outcomeLabel] ?? defaultProb;
  };

  const handleSubmitForecast = async (predictionId: string) => {
    const prediction = predictions.find((p) => p.id === predictionId);
    if (!prediction) return;

    setSaving(true);
    try {
      for (const outcome of prediction.outcomes) {
        const confidence = getForecastValue(predictionId, outcome.label, outcome.probability ?? 0);

        // Check if user already has a forecast for this outcome
        const existingForecast = userForecasts.find(
          (f) => f.predictionId === predictionId && f.outcomeId === outcome.id
        );

        if (existingForecast) {
          await client.models.Forecast.update(
            { id: existingForecast.id, confidence },
            { authMode: "userPool" }
          );
        } else {
          await client.models.Forecast.create(
            {
              predictionId,
              outcomeId: outcome.id,
              confidence,
            },
            { authMode: "userPool" }
          );
        }
      }

      // Reload user forecasts
      await loadUserForecasts();
      setActiveForecast(null);
    } catch (err) {
      console.error("Failed to save forecast:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Active Predictions</h1>
          <p>Loading predictions...</p>
        </header>
      </div>
    );
  }

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
        {predictions.length === 0 && (
          <p style={{ color: "#64748b" }}>No predictions yet. Seed the database to get started.</p>
        )}
        {predictions.map((prediction) => (
          <div key={prediction.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span
                className={styles.badge}
                style={{
                  backgroundColor: `${categoryColors[prediction.category ?? "OTHER"]}20`,
                  color: categoryColors[prediction.category ?? "OTHER"],
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
                  {activeForecast === prediction.id && (
                    <div className={styles.forecastSlider}>
                      <div className={styles.forecastSliderHeader}>
                        <span className={styles.forecastLabel}>Your forecast</span>
                        <span className={styles.forecastValue}>
                          {getForecastValue(prediction.id, outcome.label, outcome.probability ?? 0)}%
                        </span>
                      </div>
                      <div className={styles.sliderTrack}>
                        <div
                          className={styles.sliderFill}
                          style={{
                            width: `${getForecastValue(prediction.id, outcome.label, outcome.probability ?? 0)}%`,
                          }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={getForecastValue(prediction.id, outcome.label, outcome.probability ?? 0)}
                          onChange={(e) =>
                            handleSliderChange(prediction.id, outcome.label, Number(e.target.value))
                          }
                          className={styles.slider}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.cardFooter}>
              <span>Resolves: {prediction.resolutionDate}</span>
              {activeForecast === prediction.id ? (
                <div className={styles.forecastActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setActiveForecast(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={() => handleSubmitForecast(prediction.id)}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Submit"}
                  </button>
                </div>
              ) : (
                <button className={styles.forecastBtn} onClick={() => handleMakeForecast(prediction.id)}>
                  {userForecasts.some((f) => f.predictionId === prediction.id) ? "Update Forecast" : "Make Forecast"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
