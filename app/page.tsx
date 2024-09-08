"use client";
import TypingAnimation from "@/components/ui/typing";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useEffect } from "react";
import { useTelegram } from "@/context/TelegramProvider";
import { useWeb3 } from "@/context/Web3Provider";
interface TelegramWebApp {
  ready: () => void;
  showPopup: (params: { title?: string; message: string; buttons: Array<{ text: string; type: string }> }) => void;
  initData: string;
  initDataUnsafe: any;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export default function Home() {
  const { login } = useWeb3();
  const { user, webApp } = useTelegram();

  useEffect(() => {
    if (user && webApp) {
      webApp.expand();
    }
  }, [webApp, user]);

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <TypingAnimation />

        <div className="flex gap-2">
          <button onClick={login} className="mt-6 bg-amber-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg w-[219px] h-[40px] px-4 py-2">
            Login with Wallet
          </button>
        </div>
      </WavyBackground>
    </main>
  );
}
