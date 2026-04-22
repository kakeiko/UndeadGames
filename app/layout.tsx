import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UndeadGames",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
