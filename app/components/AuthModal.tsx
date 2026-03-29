"use client";

import { Authenticator, ThemeProvider, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import styles from "./AuthModal.module.css";

const atlasTheme = {
  name: "atlas",
  tokens: {
    colors: {
      brand: {
        primary: {
          10:  { value: "#eff6ff" },
          20:  { value: "#dbeafe" },
          40:  { value: "#93c5fd" },
          60:  { value: "#3b82f6" },
          80:  { value: "#2563eb" },
          90:  { value: "#1d4ed8" },
          100: { value: "#1e40af" },
        },
      },
    },
    fonts: {
      default: {
        variable: { value: "system-ui, sans-serif" },
        static:   { value: "system-ui, sans-serif" },
      },
    },
    radii: {
      small:  { value: "6px" },
      medium: { value: "8px" },
      large:  { value: "10px" },
      xl:     { value: "12px" },
    },
  },
};

function AuthHeader() {
  return (
    <div className={styles.brandHeader}>
      <span className={styles.brandIcon}>🌐</span>
      <span className={styles.brandName}>PredictorAtlas</span>
    </div>
  );
}

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { authStatus } = useAuthenticator();

  useEffect(() => {
    if (authStatus === "authenticated") onClose();
  }, [authStatus, onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <ThemeProvider theme={atlasTheme}>
          <Authenticator components={{ Header: AuthHeader }} />
        </ThemeProvider>
      </div>
    </div>
  );
}
