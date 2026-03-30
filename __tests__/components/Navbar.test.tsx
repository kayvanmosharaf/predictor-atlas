import React from "react";
import { render, screen, fireEvent } from "../utils/test-utils";
import Navbar from "@/app/components/Navbar";

const mockUseAuthenticator = (globalThis as Record<string, unknown>).__mockUseAuthenticator as jest.Mock;
const mockSignOut = (globalThis as Record<string, unknown>).__mockSignOut as jest.Mock;

// Mock useAdmin
jest.mock("@/app/hooks/useAdmin", () => ({
  useAdmin: jest.fn(() => ({ isAdmin: false, loading: false })),
}));

// Mock AuthModal
jest.mock("@/app/components/AuthModal", () => {
  return function MockAuthModal({ onClose }: { onClose: () => void }) {
    return <div data-testid="auth-modal"><button onClick={onClose}>Close</button></div>;
  };
});

import { useAdmin } from "@/app/hooks/useAdmin";

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthenticator.mockReturnValue({
      authStatus: "authenticated",
      user: { username: "testuser" },
      signOut: mockSignOut,
    });
    (useAdmin as jest.Mock).mockReturnValue({ isAdmin: false, loading: false });
  });

  it("renders navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("Predictions")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("renders logo", () => {
    render(<Navbar />);
    expect(screen.getByText("PredictorAtlas")).toBeInTheDocument();
  });

  it("shows Sign Out button when authenticated", () => {
    render(<Navbar />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("shows Dashboard link when authenticated", () => {
    render(<Navbar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows Sign In button when unauthenticated", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: mockSignOut,
    });
    render(<Navbar />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("does not show Dashboard link when unauthenticated", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: mockSignOut,
    });
    render(<Navbar />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls signOut when Sign Out button is clicked", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows Admin link when isAdmin is true", () => {
    (useAdmin as jest.Mock).mockReturnValue({ isAdmin: true, loading: false });
    render(<Navbar />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("does not show Admin link when isAdmin is false", () => {
    render(<Navbar />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("opens AuthModal when Sign In is clicked", () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: mockSignOut,
    });
    render(<Navbar />);
    fireEvent.click(screen.getByText("Sign In"));
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
  });
});
