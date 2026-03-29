"use client";

import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import styles from "./dashboard.module.css";

function DashboardContent() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

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

export default function DashboardPage() {
  return (
    <Authenticator>
      <DashboardContent />
    </Authenticator>
  );
}
