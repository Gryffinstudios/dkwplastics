import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Lanka's Plastic Manufacturing Expert - DKW Plastics",
  description: "DKW Plastics is a leading plastic manufacturing company in Sri Lanka, specializing in custom plastic manufacturing.",
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
