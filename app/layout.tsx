import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ThemeToggle from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { PcaDataProvider } from "@/context/pca-data-context"
import "./globals.css";

import BreadCrumbNav from "@/components/bread-crumb-nav"

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairyBread",
  description: "Interactive data visualization tool for exploring Principal Component Analysis (PCA) of crop genetic diversity",
};

function AppFrame({
  children,
  defaultOpen,
}: Readonly<{
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="p-2">
        <div className="sticky top-2 z-50 flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <BreadCrumbNav />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

async function AppFrameWithCookie({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let defaultOpen = true;

  try {
    const cookieStore = await cookies();
    defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  } catch (error) {
    // Root layout must stay renderable; fall back if cookie access fails.
    console.error("Failed to read sidebar_state cookie in root layout", error);
  }

  return <AppFrame defaultOpen={defaultOpen}>{children}</AppFrame>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NuqsAdapter>
          <Suspense fallback={null}>
            <ThemeProvider>
              {/* PcaDataProvider owns the shared fetch state — must sit inside
                  NuqsAdapter (already the parent) so useQueryState works */}
              <PcaDataProvider>
                <AppFrameWithCookie>{children}</AppFrameWithCookie>
              </PcaDataProvider>
            </ThemeProvider>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
