import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latihan Pengucapan Fonem",
  description:
    "Analisis durasi dan kesesuaian fonem per kata dalam kalimat dengan batas fonem referensi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

