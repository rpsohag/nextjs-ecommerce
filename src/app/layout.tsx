import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import {ClerkProvider} from '@clerk/nextjs'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "ShopNow",
  description: "ShopNow || your complete ecommerce solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ClerkProvider>
          <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              </ThemeProvider>
            </body>
          </html>
        </ClerkProvider>
  );
}
