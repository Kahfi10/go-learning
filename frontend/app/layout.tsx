import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import CommandSearch from "@/components/search/CommandSearch";
import "./globals.css";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
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
