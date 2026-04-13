import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circle Fan sheet",
  description: "Track your Circle's fan gains",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-white font-body antialiased">{children}</body>
    </html>
  );
}
