import React from "react";
import { render, screen, fireEvent } from "../utils/test-utils";
import DashboardPage from "@/app/dashboard/page";

const mockUseAuthenticator = (globalThis as Record<string, unknown>).__mockUseAuthenticator as jest.Mock;
const mockSignOut = (globalThis as Record<string, unknown>).__mockSignOut as jest.Mock;

// Mock AuthModal
jest.mock("@/app/components/AuthModal", () => {
  return function MockAuthModal({ onClose }: { onClose: () => void }) {
    return <div data-testid="auth-modal"><button onClick={onClose}>Close</button></div>;
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows dashboard content when authenticated", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "authenticated",
      user: { username: "testuser", signInDetails: { loginId: "test@example.com" } },
      signOut: mockSignOut,
    });
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Forecasts Made")).toBeInTheDocument();
    expect(screen.getByText("Accuracy Score")).toBeInTheDocument();
    expect(screen.getByText("Active Predictions")).toBeInTheDocument();
  });

  it("shows sign-in prompt when unauthenticated", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: mockSignOut,
    });
    render(<DashboardPage />);
    expect(screen.getByText("Sign in to view your dashboard")).toBeInTheDocument();
  });

  it("opens AuthModal from sign-in prompt", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: mockSignOut,
    });
    render(<DashboardPage />);
    fireEvent.click(screen.getByText("Sign In"));
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });

  it("calls signOut when Sign Out is clicked", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "authenticated",
      user: { username: "testuser", signInDetails: { loginId: "test@example.com" } },
      signOut: mockSignOut,
    });
    render(<DashboardPage />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
