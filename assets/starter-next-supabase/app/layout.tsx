import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harness Starter",
  description: "Next.js + Supabase starter with safe server workflows"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
