"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import styles from "./AuthModal.module.css";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    setRedirectTo(
      `${window.location.origin}/auth/callback?next=/auth/update-password`
    );
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") onClose();
    });
    return () => subscription.unsubscribe();
  }, [supabase, onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className={styles.brandHeader}>
          <span className={styles.brandIcon}>🌐</span>
          <span className={styles.brandName}>PredictorAtlas</span>
        </div>
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#3b82f6",
                    brandAccent: "#2563eb",
                    inputBackground: "#1e293b",
                    inputBorder: "rgba(255, 255, 255, 0.1)",
                    inputText: "#e2e8f0",
                    inputLabelText: "#94a3b8",
                    anchorTextColor: "#3b82f6",
                    defaultButtonBackground: "#1e293b",
                    defaultButtonBorder: "rgba(255, 255, 255, 0.1)",
                    defaultButtonText: "#94a3b8",
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "8px",
                    buttonBorderRadius: "8px",
                    inputBorderRadius: "8px",
                  },
                },
              },
              style: {
                button: {
                  fontWeight: "600",
                },
              },
            }}
            theme="dark"
            providers={[]}
            view="sign_in"
            redirectTo={redirectTo}
          />
        </div>
      </div>
    </div>
  );
}
