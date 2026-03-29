"use client";

import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { authStatus } = useAuthenticator();

  useEffect(() => {
    async function checkAdmin() {
      setLoading(true);
      try {
        if (authStatus !== "authenticated") {
          setIsAdmin(false);
          return;
        }
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken?.payload?.["cognito:groups"] as string[] | undefined) ?? [];
        setIsAdmin(groups.includes("admin"));
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [authStatus]);

  return { isAdmin, loading };
}
