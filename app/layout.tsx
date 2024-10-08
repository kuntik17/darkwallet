"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import { TelegramProvider } from "@/context/TelegramProvider";
import { MetaMaskProvider } from "@metamask/sdk-react";
import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <MetaMaskProvider
        debug={false}
        sdkOptions={{
          dappMetadata: {
            name: "Dark Wallet",
            url: "https://darkwallet-vmrt.vercel.app/",
          },
        }}
      >
        <TelegramProvider>
          <Web3Provider>
            <body className={inter.className}>{children}</body>
          </Web3Provider>
        </TelegramProvider>
      </MetaMaskProvider>
    </html>
  );
}
