"use client";

import Link from "next/link";
import { useAuthenticator } from "@aws-amplify/ui-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        PredictorAtlas
      </Link>

      <div className={styles.links}>
        <Link href="/predictions">Predictions</Link>
        <Link href="/about">About</Link>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <button onClick={signOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/dashboard" className={styles.signInLink}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
