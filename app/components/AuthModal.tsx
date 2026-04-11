"use client";

import { Authenticator, ThemeProvider, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useCallback } from "react";
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

function SignInFooter() {
  const { toSignUp, toForgotPassword } = useAuthenticator();
  return (
    <div className={styles.signInFooter}>
      <button className={styles.forgotLink} onClick={toForgotPassword} type="button">
        Forgot Password?
      </button>
      <div className={styles.signUpFooter}>
        <span>Don&apos;t have an account?</span>
        <button className={styles.signUpLink} onClick={toSignUp} type="button">
          Create Account
        </button>
      </div>
    </div>
  );
}

function SignUpFooter() {
  const { toSignIn } = useAuthenticator();
  return (
    <div className={styles.signUpFooter}>
      <span>Already have an account?</span>
      <button className={styles.signUpLink} onClick={toSignIn} type="button">
        Sign In
      </button>
    </div>
  );
}

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { authStatus } = useAuthenticator();

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (authStatus === "authenticated") handleClose();
  }, [authStatus, handleClose]);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>
        <ThemeProvider theme={atlasTheme}>
          <Authenticator
            initialState="signIn"
            signUpAttributes={["email"]}
            components={{
              Header: AuthHeader,
              SignIn: { Footer: SignInFooter },
              SignUp: { Footer: SignUpFooter },
            }}
          />
        </ThemeProvider>
      </div>
    </div>
  );
}
