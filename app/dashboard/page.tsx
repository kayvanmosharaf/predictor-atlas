"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState } from "react";
import styles from "./dashboard.module.css";
import AuthModal from "../components/AuthModal";

export default function DashboardPage() {
  const { user, authStatus, signOut } = useAuthenticator();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (authStatus !== "authenticated") {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Sign in to view your dashboard</h2>
          <p>Track your forecasts, accuracy score, and active predictions.</p>
          <button
            className={styles.signOutBtn}
            onClick={() => setShowAuthModal(true)}
          >
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
          <h1>Dashboard</h1>
          <p className={styles.email}>{user?.signInDetails?.loginId}</p>
        </div>
        <button onClick={signOut} className={styles.signOutBtn}>
          Sign Out
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Forecasts Made</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>--</span>
          <span className={styles.statLabel}>Accuracy Score</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Active Predictions</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Your Recent Forecasts</h2>
        <div className={styles.emptyState}>
          <p>You haven&apos;t made any forecasts yet.</p>
          <p>Head to the predictions page to get started.</p>
        </div>
      </section>
    </div>
  );
}
