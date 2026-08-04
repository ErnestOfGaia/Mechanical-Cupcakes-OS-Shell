import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Penny Post",
  description:
    "Write a postcard, watch it arrive. No account, no database, no email — nothing leaves your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* No <link> to any font service. Typography is system serif stacks by
          design — see globals.css. A single web-font request would falsify the
          claim this whole app is built to make. */}
      <body>{children}</body>
    </html>
  );
}
