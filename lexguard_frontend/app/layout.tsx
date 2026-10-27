import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEXGUARD | AI Contract Intelligence",
  description:
    "AI-powered contract analysis. Understand legal risks before you sign.",
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
