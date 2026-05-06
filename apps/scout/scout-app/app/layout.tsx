import "../src/app/globals.css";

export const metadata = {
  title: "Scout Protocol — Garage v0.1",
  description: "Decentralized agent discovery prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="garage-shell">{children}</body>
    </html>
  );
}
