"use client";
import TelegramLogin from "@/components/ui/telegram-login";
import TypingAnimation from "@/components/ui/typing";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useWeb3 } from "@/context/Web3Provider";

export default function Home() {
  const { login } = useWeb3();

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <TypingAnimation />
        <div className="flex gap-2">
          <button onClick={login} className="mt-6 bg-amber-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg w-[219px] h-[40px] px-4 py-2">
            Login with Wallet
          </button>
          {/* <TelegramLogin /> */}
        </div>
      </WavyBackground>
    </main>
  );
}
