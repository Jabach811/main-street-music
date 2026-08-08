import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Main Street Music",
  description: "Lessons, gear, rentals, and repairs from Main Street Music in downtown Tracy, California."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

