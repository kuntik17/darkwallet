"use client";
import TypingAnimation from "@/components/ui/typing";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useEffect, useState } from "react";
import { getSessionSignatures, connectToLitNodes, connectToLitContracts } from "@/lib/litConnections";
import { useSDK } from "@metamask/sdk-react";

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
  interface TelegramWebApp {
    ready: () => void;
    showPopup: (params: { title?: string; message: string; buttons: Array<{ text: string; type: string }> }) => void;
    initData: string;
    initDataUnsafe: any;
  }

  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const { sdk, connected, /*connecting, */ provider /*chainId*/ } = useSDK();
  const [pkp, setPkp] = useState<{
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  } | null>(null);
  const [sessionSignatures, setSessionSignatures] = useState<any | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [recent, setRecent] = useState<boolean | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      tgApp.ready();
      setWebApp(tgApp);
      setData(tgApp.initData);

      isRecent(tgApp.initData).then((isRecent) => {
        setRecent(isRecent);
      });

      verifyInitData(tgApp.initData, process.env.NEXT_PUBLIC_TELEGRAM_BOT_SECRET as string)
        .then((isVerified) => {
          console.log("isVerified", isVerified);
          setValid(isVerified);
        })
        .catch((error) => {
          console.error("Error verifying init data:", error);
        });
    }
  }, []);

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

    let dataCheckString = "";
    for (const [key, value] of urlParams.entries()) {
      dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);

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

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
      webApp!.showPopup({
        title: "Connected",
        message: `Connected to MetaMask with account: ${accounts[0]}`,
        buttons: [{ text: "Close", type: "close" }],
      });
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const getSS = async () => {
    const litNodeClient = await connectToLitNodes();
    const sessionSignatures = await getSessionSignatures(litNodeClient, pkp, data);
    setSessionSignatures(sessionSignatures);
  };

  const mintPkp = async () => {
    const pkp = await connectToLitContracts(provider);
    setPkp(pkp);
  };

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <TypingAnimation />
        <div className="flex gap-2">
          <button onClick={connect} className="mt-6 bg-amber-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg w-[219px] h-[40px] px-4 py-2">
            Login with Wallet
          </button>
        </div>
      </WavyBackground>
    </main>
  );
}
