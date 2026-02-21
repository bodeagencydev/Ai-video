import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bode Agency AI",
  description: "Generate AI ad concepts with prompt, media, and voice style controls"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
