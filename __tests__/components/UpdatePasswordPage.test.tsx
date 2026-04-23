import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";

const mockUpdateUser = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      updateUser: mockUpdateUser,
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => "/auth/update-password",
  useSearchParams: () => new URLSearchParams(),
}));

import UpdatePasswordPage from "@/app/auth/update-password/page";

describe("UpdatePasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the password fields and submit button", () => {
    render(<UpdatePasswordPage />);
    expect(screen.getByText("Set a new password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i })
    ).toBeInTheDocument();
  });

  it("shows an error and does not submit when passwords do not match", async () => {
    render(<UpdatePasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "abcdef1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different1" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /update password/i }).closest("form")!
    );
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("shows an error when password is shorter than 6 characters", async () => {
    render(<UpdatePasswordPage />);
    // bypass HTML minLength by directly submitting with short values
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "abc" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /update password/i }).closest("form")!
    );
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters.")
      ).toBeInTheDocument();
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("calls updateUser and redirects to /dashboard on success", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newpass123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /update password/i }).closest("form")!
    );
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpass123" });
    });
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays the Supabase error message on failure", async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: "Auth session missing!" },
    });
    render(<UpdatePasswordPage />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newpass123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /update password/i }).closest("form")!
    );
    await waitFor(() => {
      expect(screen.getByText("Auth session missing!")).toBeInTheDocument();
    });
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
