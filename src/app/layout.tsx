import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CircleTrack",
  description: "Track your Circle's fan gains",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-white font-sans antialiased">{children}</body>
    </html>
  );
}
