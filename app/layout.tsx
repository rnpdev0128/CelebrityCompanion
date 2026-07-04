import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "sonner"
import { ProModal } from "@/components/pro-modal";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <ProModal />
          </ThemeProvider>
          <Toaster richColors position="top-right" />
        </ClerkProvider>
      </body>
    </html>
  )
}
