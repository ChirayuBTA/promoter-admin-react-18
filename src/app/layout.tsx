import { ThemeProvider } from "@/components/provider/theme-provider";
import "@/app/globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/components/provider/SessionProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel with Next.js, Tailwind, and ShadCN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LayoutWrapper>
              <Toaster position="bottom-center" />
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
