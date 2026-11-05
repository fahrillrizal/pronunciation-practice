import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phoneme Pronunciation Practice",
  description:
    "Analyze phoneme duration and accuracy for each word against reference phoneme boundaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

