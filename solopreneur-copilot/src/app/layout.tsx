import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "超级个体创业OS",
  description: "Solopreneur Copilot - 你的创业副驾驶",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SessionProvider>
          <AppShell>{children}</AppShell>
          <Toaster theme="dark" position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
