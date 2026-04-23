import React from "react";
import { render, waitFor, act } from "../utils/test-utils";

const authProps: Array<Record<string, unknown>> = [];
let capturedAuthStateChangeCallback:
  | ((event: string) => void)
  | null = null;

jest.mock("@supabase/auth-ui-react", () => ({
  Auth: (props: Record<string, unknown>) => {
    authProps.push(props);
    return null;
  },
}));

jest.mock("@supabase/auth-ui-shared", () => ({
  ThemeSupa: {},
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn((cb: (event: string) => void) => {
        capturedAuthStateChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
  })),
}));

import AuthModal from "@/app/components/AuthModal";

describe("AuthModal", () => {
  beforeEach(() => {
    authProps.length = 0;
    capturedAuthStateChangeCallback = null;
  });

  it("passes a redirectTo that points at /auth/callback with next=/auth/update-password", async () => {
    render(<AuthModal onClose={() => {}} />);
    await waitFor(() => {
      const last = authProps[authProps.length - 1];
      expect(last).toBeDefined();
      expect(last.redirectTo).toEqual(
        `${window.location.origin}/auth/callback?next=/auth/update-password`
      );
    });
  });

  it("renders the sign-in view with no external OAuth providers", () => {
    render(<AuthModal onClose={() => {}} />);
    const last = authProps[authProps.length - 1];
    expect(last.view).toBe("sign_in");
    expect(last.providers).toEqual([]);
  });

  it("closes the modal when a SIGNED_IN auth event fires", async () => {
    const onClose = jest.fn();
    render(<AuthModal onClose={onClose} />);
    await waitFor(() => {
      expect(capturedAuthStateChangeCallback).not.toBeNull();
    });
    act(() => {
      capturedAuthStateChangeCallback!("SIGNED_IN");
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close the modal on non-SIGNED_IN events", async () => {
    const onClose = jest.fn();
    render(<AuthModal onClose={onClose} />);
    await waitFor(() => {
      expect(capturedAuthStateChangeCallback).not.toBeNull();
    });
    act(() => {
      capturedAuthStateChangeCallback!("PASSWORD_RECOVERY");
      capturedAuthStateChangeCallback!("TOKEN_REFRESHED");
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
