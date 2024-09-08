"use client";
import TypingAnimation from "@/components/ui/typing";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useEffect, useState } from "react";
import { getSessionSignatures, connectToLitNodes, connectToLitContracts } from "@/lib/litConnections";
import { useTelegram } from "@/context/TelegramProvider";
import { useSDK } from "@metamask/sdk-react";
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
  const { user, webApp } = useTelegram();
  const { sdk, connected, provider } = useSDK();
  const { login } = useWeb3();

  const [account, setAccount] = useState<string | null>(null);

  const [pkp, setPkp] = useState<{
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  } | null>(null);
  const [sessionSignatures, setSessionSignatures] = useState<any | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [recent, setRecent] = useState<boolean | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [telegram, setTelegram] = useState<boolean>(false);

  useEffect(() => {
    if (user && webApp) {
      webApp.expand();
      setTelegram(true);
      if (connected && provider) {
        mintPkp();
      }
    } else {
      setTelegram(false);
    }
  }, [webApp, user, provider, connected]);

  async function isRecent(telegramInitData: string) {
    const urlParams: URLSearchParams = new URLSearchParams(telegramInitData);
    const auth_date = Number(urlParams.get("auth_date"));
    const isRecent = Date.now() / 1000 - auth_date < 600;
    return isRecent;
  }

  async function verifyInitData(telegramInitData: string, botToken: string) {
    const urlParams: URLSearchParams = new URLSearchParams(telegramInitData);

    const hash = urlParams.get("hash");
    urlParams.delete("hash");
    urlParams.sort();
    let dataCheckString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const encoder = new TextEncoder();
    const secretKey = await window.crypto.subtle.importKey("raw", encoder.encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

    const botTokenKey = await window.crypto.subtle.sign("HMAC", secretKey, encoder.encode(botToken));

    const calculatedHash = await window.crypto.subtle.sign(
      "HMAC",
      await window.crypto.subtle.importKey("raw", botTokenKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(dataCheckString)
    );

    const calculatedHashHex = Array.from(new Uint8Array(calculatedHash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isVerified = hash === calculatedHashHex;
    return isVerified;
  }

  const getSS = async () => {
    console.log("getting ss", pkp);
    const litNodeClient = await connectToLitNodes();
    const sessionSignatures = await getSessionSignatures(litNodeClient, pkp, data);
    console.log("sessionSignatures", sessionSignatures);
    setSessionSignatures(sessionSignatures);
  };

  const mintPkp = async () => {
    const pkp = await connectToLitContracts(provider);
    setPkp(pkp);
    getSS();
  };

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <TypingAnimation />
        {telegram ? (
          <div className="flex gap-2">
            <button onClick={login} className="mt-6 bg-amber-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg w-[219px] h-[40px] px-4 py-2">
              Login with Wallet
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => window.open("https://t.me/darkvaultwallet_bot", "_blank")}
              className="mt-6 bg-amber-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg w-[219px] h-[40px] px-4 py-2"
            >
              Open app in Telegram
            </button>
          </div>
        )}
      </WavyBackground>
    </main>
  );
}
