import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import Script from "next/script";
import { TelegramProvider } from "@/context/TelegramProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramProvider>
        <Web3Provider>
          <body className={inter.className}>{children}</body>
        </Web3Provider>
      </TelegramProvider>
    </html>
  );
}
