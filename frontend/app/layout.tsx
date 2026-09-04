import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "@/context/AuthContext";
import CommandSearch from "@/components/search/CommandSearch";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "GoLearn — Learn Go. The Elegant Way.", template: "%s | GoLearn" },
  description: "Platform pembelajaran Go interaktif dengan 15 topik, 76 lessons, bilingual ID/EN, dan code editor langsung di browser.",
  keywords: ["Go", "Golang", "belajar Go", "learn Go", "programming", "tutorial"],
  openGraph: {
    title: "GoLearn — Learn Go. The Elegant Way.",
    description: "Platform pembelajaran Go interaktif bilingual.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <NextTopLoader 
          color="#0071E3" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #0071E3,0 0 5px #0071E3" 
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            {children}
            <CommandSearch />
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
