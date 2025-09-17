import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE PASS - The Recipe for Restaurant Success",
  description: "THE PASS - Advanced task management for restaurant excellence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
