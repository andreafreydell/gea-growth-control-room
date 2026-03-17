import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

export const metadata: Metadata = {
  title: "GEA Growth Control Room",
  description: "Weekly growth analysis and recommendations for GEA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gea-bg text-gea-text font-sans">
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
