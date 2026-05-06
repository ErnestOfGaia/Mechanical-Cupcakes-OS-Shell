import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout Protocol Garage",
  description: "Local Garage v0.1 prototype for Scout Protocol.",
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
