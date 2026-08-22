import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "memory-workshop — เปรียบเทียบ search backend",
  description: "พิมพ์ query เดียว เห็นผลจาก 5 backend พร้อมกัน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
