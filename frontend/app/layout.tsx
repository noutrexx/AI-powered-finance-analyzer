import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Analyzer",
  description: "Personal finance dashboard with CSV imports and rule-based insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

