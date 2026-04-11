"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import styles from "./Navbar.module.css";
import { useAdmin } from "../hooks/useAdmin";
import AuthModal from "./AuthModal";

const links = [
  { href: "/predictions", label: "Predictions" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { authStatus, signOut } = useAuthenticator();
  const { isAdmin } = useAdmin();

  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          PredictorAtlas
        </Link>

        <div className={styles.links}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.active : ""}
            >
              {label}
            </Link>
          ))}
          {authStatus === "authenticated" && (
            <>
              <Link
                href="/my-predictions"
                className={pathname === "/my-predictions" ? styles.active : ""}
              >
                My Predictions
              </Link>
              <Link
                href="/dashboard"
                className={pathname === "/dashboard" ? styles.active : ""}
              >
                Dashboard
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`${styles.adminLink} ${pathname.startsWith("/admin") ? styles.active : ""}`}
            >
              Admin
            </Link>
          )}
          {authStatus === "authenticated" ? (
            <button onClick={signOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          ) : (
            <button
              className={styles.signInBtn}
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
