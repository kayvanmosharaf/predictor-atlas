"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import styles from "./PredictionForm.module.css";

const categories = ["POLITICS", "ECONOMICS", "SPORTS", "GEOPOLITICS", "TECHNOLOGY", "OTHER"] as const;

interface OutcomeInput {
  label: string;
  probability: number;
}

interface PredictionFormProps {
  onCancel: () => void;
  onCreated: () => void;
  defaultVisibility?: "PRIVATE" | "PUBLIC";
  showVisibilityToggle?: boolean;
}

export default function PredictionForm({
  onCancel,
  onCreated,
  defaultVisibility = "PRIVATE",
  showVisibilityToggle = false,
}: PredictionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<typeof categories[number]>("OTHER");
  const [resolutionDate, setResolutionDate] = useState("");
  const [visibility, setVisibility] = useState(defaultVisibility);
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { label: "", probability: 50 },
    { label: "", probability: 50 },
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, { label: "", probability: 0 }]);
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length <= 2) return;
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const handleOutcomeChange = (index: number, field: keyof OutcomeInput, value: string | number) => {
    setOutcomes(
      outcomes.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    );
  };

  const validOutcomes = outcomes.filter((o) => o.label.trim());
  const canSubmit = title.trim() && description.trim() && validOutcomes.length >= 2 && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSaving(true);
    try {
      await apiFetch("/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          status: "OPEN",
          visibility,
          resolutionDate: resolutionDate || undefined,
          outcomes: validOutcomes.map((o) => ({
            label: o.label.trim(),
            probability: o.probability,
          })),
        }),
      });

      onCreated();
    } catch (err) {
      console.error("Failed to create prediction:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h2>Create Prediction</h2>

      <div className={styles.formGroup}>
        <label>Title</label>
        <input
          className={styles.formInput}
          type="text"
          placeholder="e.g., Will AI pass the Turing test by 2027?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea
          className={styles.formTextarea}
          placeholder="Describe the prediction, context, and what would count as resolution..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Category</label>
          <select
            className={styles.formSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof categories[number])}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Resolution Date</label>
          <input
            className={styles.formInput}
            type="date"
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
          />
        </div>
      </div>

      {showVisibilityToggle && (
        <div className={styles.visibilityToggle}>
          <label>Visibility</label>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${visibility === "PUBLIC" ? styles.active : ""}`}
            onClick={() => setVisibility(visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC")}
          >
            <span className={styles.toggleKnob} />
          </button>
          <span className={styles.visibilityLabel}>
            {visibility === "PUBLIC" ? "Public — visible to everyone" : "Private — only you can see this"}
          </span>
        </div>
      )}

      <div className={styles.outcomesSection}>
        <label>Outcomes (at least 2)</label>
        {outcomes.map((outcome, i) => (
          <div key={i} className={styles.outcomeRow}>
            <input
              className={styles.formInput}
              type="text"
              placeholder={`Outcome ${i + 1}`}
              value={outcome.label}
              onChange={(e) => handleOutcomeChange(i, "label", e.target.value)}
            />
            <input
              className={`${styles.formInput} ${styles.outcomeProb}`}
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={outcome.probability}
              onChange={(e) => handleOutcomeChange(i, "probability", Number(e.target.value))}
            />
            {outcomes.length > 2 && (
              <button
                className={styles.removeOutcomeBtn}
                onClick={() => handleRemoveOutcome(i)}
              >
                X
              </button>
            )}
          </div>
        ))}
        <button className={styles.addOutcomeBtn} onClick={handleAddOutcome}>
          + Add Outcome
        </button>
      </div>

      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {saving ? "Creating..." : "Create Prediction"}
        </button>
      </div>
    </div>
  );
}
