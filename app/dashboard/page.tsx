"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { BsEye } from "react-icons/bs";
import Popup from "@/components/ui/popup";
import { useCallback, useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Provider";
import { blobToBase64, encodeb64 } from "@/lib/lit";
import ViewPopup from "@/components/ui/viewPopup";
import TelegramLoginButton from "@/components/ui/telegram-login";
import { TelegramUser } from "@/types/types";
import TelegramLogin from "@/components/ui/telegram-login";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [openView, setOpenView] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { address, hideMessage, messages, viewMessage } = useWeb3();

  const handleForm = (formData: any) => {
    if (formData.type === "text") {
      hideMessage(formData.title, formData.message, formData.type);
      // } else {
      //   const blobData = formData.file;
      //   const blob = new Blob([blobData], { type: blobData.type });
      //   blobToBase64(blob).then((base64) => {
      //     const encoded = encodeb64(base64);
      //     hideMessage(formData.title, encoded as string, formData.type);
      //   });
    }
    setOpen(false);
  };

  const handleView = async (id: string) => {
    const message = messages.find((message) => message.id === id);
    const data = await viewMessage(message.ciphertext, message.dataToEncryptHash, message.type);
    setData({
      title: message.title,
      message: data,
    });
    setOpenView(true);
  };

  useEffect(() => {
    if (telegramUser) {
      console.log("Current telegramUser state:", telegramUser);
    }
  }, [telegramUser]);

  const verifyTelegramUser = useCallback(async (user: TelegramUser): Promise<{ isValid: boolean; isRecent: boolean }> => {
    console.log("🔄 Validating user Telegram info client side...");
    const { hash, ...otherData } = user;

    const dataCheckString = Object.entries(otherData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const encoder = new TextEncoder();
    const secretKeyHash = await crypto.subtle.digest("SHA-256", encoder.encode("7526831514:AAGBKD5tLaTsocnuddipaobSNBRAmk_-6BQ"));
    const key = await crypto.subtle.importKey("raw", secretKeyHash, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(dataCheckString));

    const calculatedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = calculatedHash === user.hash;
    const isRecent = Date.now() / 1000 - user.auth_date < 600;

    console.log(`ℹ️ User Telegram data is valid: ${isValid}. User data is recent: ${isRecent}`);

    return { isValid, isRecent };
  }, []);

  const handleTelegramResponse = useCallback(
    async (user: TelegramUser) => {
      console.log("Telegram auth response received:", user);
      if (user && typeof user === "object") {
        setTelegramUser(user);

        const { isValid, isRecent } = await verifyTelegramUser(user);
        if (!isValid || !isRecent) {
          setValidationError(!isValid ? "Failed to validate Telegram user info. Please try again." : "Authentication has expired. Please log in again.");
        } else {
          setValidationError(null);
        }
      } else {
        console.error("Invalid user data received:", user);
        setValidationError("Invalid user data received. Please try again.");
      }
    },
    [verifyTelegramUser]
  );

  return (
    <main className="h-[100vh] flex justify-center items-center bg-black">
      <Popup open={open} setOpen={setOpen} handleForm={handleForm} />
      <ViewPopup open={openView} setOpen={setOpenView} data={data} />
      <WavyBackground className="flex flex-col justify-center items-center text-white">
        <div className="border border-1 bg-black border-amber-200 px-4 py-5 rounded-lg">
          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-4">
              <h3 className="text-base font-semibold leading-6 text-amber-200">Add data to your wallet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your data will be encrypted and saved to the chain. <br></br>The wallet you have permission to retrieve it.
              </p>
            </div>
            <div className="ml-4 mt-4 flex-shrink-0">
              <button
                type="button"
                className="relative text-black inline-flex items-center rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                onClick={() => setOpen(true)}
              >
                Add data
              </button>
              <TelegramLogin />
            </div>
          </div>
          <h3 className="text-base font-semibold leading-6 text-amber-200 mt-8">Current data in your wallet</h3>
          <ul role="list" className="divide-y divide-gray-100">
            {messages && messages.length > 0 ? (
              messages.map((file: any) => (
                <li key={file.title} className="flex justify-between gap-x-6 py-5">
                  <div className="flex gap-x-4">
                    {" "}
                    <div className="flex-auto">
                      <p className="text-sm mt-1 font-semibold leading-6 text-amber-200">{file.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <button className="flex flex-row gap-2  text-cyan-500" onClick={() => handleView(file.id)}>
                      Reveal <BsEye className="h-6 w-6  text-cyan-500" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Nothing to hide</p>
            )}
          </ul>
        </div>
      </WavyBackground>
    </main>
  );
}

// import { useState, useEffect, useCallback } from "react";

// import TelegramLoginButton from "./TelegramLoginButton";
// import { mintPkp } from "./mintPkp";
// import { getPkpSessionSigs } from "./getPkpSessionSigs";
// import { type TelegramUser } from "./types";

// type MintedPkp = {
//   tokenId: string;
//   publicKey: string;
//   ethAddress: string;
// };
// type PkpSessionSigs = any;

// interface EnvVariables {
//   VITE_TELEGRAM_BOT_NAME: string;
//   VITE_TELEGRAM_BOT_SECRET: string;
// }

// function App() {
//   const {
//     VITE_TELEGRAM_BOT_NAME = "LitDevGuidesBot",
//     VITE_TELEGRAM_BOT_SECRET,
//   } = import.meta.env as unknown as EnvVariables;

//   const [mintedPkp, setMintedPkp] = useState<MintedPkp | null>(null);
//   const [pkpSessionSigs, setPkpSessionSigs] = useState<PkpSessionSigs | null>(
//     null
//   );

//   useEffect(() => {
//     if (telegramUser) {
//       console.log("Current telegramUser state:", telegramUser);
//     }
//   }, [telegramUser]);
