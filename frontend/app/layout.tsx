import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silk Board Survival",
  description: "A text-based survival game escaping Bengaluru's Silk Board.",
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