import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay CRM",
  description: "Modern CRM with sequences, workflows, and scientifically-grounded design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
