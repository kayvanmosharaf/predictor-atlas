"use client";

import { Inter } from "next/font/google";
import "./globals.css";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Navbar from "./components/Navbar";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PredictorAtlas — Game Theory Predictions</title>
        <meta
          name="description"
          content="Predict global events using game theory. Elections, economics, geopolitics, and sports — powered by Nash equilibrium analysis."
        />
      </head>
      <body className={inter.className}>
        <Authenticator.Provider>
          <Navbar />
          <main style={{ paddingTop: "56px" }}>{children}</main>
        </Authenticator.Provider>
      </body>
    </html>
  );
}
