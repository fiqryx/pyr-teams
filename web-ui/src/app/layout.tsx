import { createMetadata } from "@/lib/metadata"
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from "@/components/providers/app-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

import {
  Geist,
  Geist_Mono
} from "next/font/google"

import "@/styles/globals.css";
import "@/styles/custom.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = createMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}>
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <AppProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>

        <Toaster />
        <SonnerToaster position="top-right" />
      </body>
    </html>
  );
}
