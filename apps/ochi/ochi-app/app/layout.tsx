import React from "react";
import "./globals.css";

export const metadata = {
  title: "OCHI Dashboard | Pacific City",
  description: "Oregon Coastal Hospitality Intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* font + canvas come from globals.css (.ochi-app / Source Sans 3) */}
      <body>
        {/* pt reserves space for the MCOS Shell bar injected at build/deploy */}
        <div className="pt-[48px]">
          {children}
        </div>
      </body>
    </html>
  );
}
