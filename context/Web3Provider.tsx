"use client";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ILitNodeClient } from "@lit-protocol/types";

import { encryptWithLit, decryptWithLit, decodeb64 } from "@/lib/lit";
import supabase from "@/lib/supabase";

import { TelegramUser } from "@/types/types";
import { mintPkp } from "@/lib/mintPkp";
import { getPkpSessionSigs } from "@/lib/getPkpSessionSigs";
import { useSDK } from "@metamask/sdk-react";
import { connectToLitContracts, getSessionSignatures, connectToLitNodes } from "@/lib/litConnections";
import { useTelegram } from "./TelegramProvider";

type MintedPkp = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};
type PkpSessionSigs = any;

type Web3ContextType = {
  address: string | null;
  login: () => void;
  hideMessage: (title: string, newMessage: string, type: string) => void;
  viewMessage: (ciphertext: string, dataToEncryptHash: string, type: string) => void;
  messages: any[];
  image: string | null;
  setTgUser: (tgUser: TelegramUser) => void;
  mint: () => void;
};

// Create a new context for the Web3 provider
export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Create a Web3 provider component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { sdk, provider } = useSDK();
  const { user, webApp } = useTelegram();
  const [lit, setLit] = useState<ILitNodeClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mintedPkp, setMintedPkp] = useState<MintedPkp | null>(null);
  const [pkpSessionSigs, setPkpSessionSigs] = useState<PkpSessionSigs | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!provider) {
          console.error("Ethereum provider not found");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error(error);
        router.push("/");
      }
    };
    init();
  }, []);

  const verifyTelegramUser = useCallback(async (user: TelegramUser): Promise<{ isValid: boolean; isRecent: boolean }> => {
    console.log("🔄 Validating user Telegram info client side...");
    const { hash, ...otherData } = user;

    const dataCheckString = Object.entries(otherData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const encoder = new TextEncoder();
    const secretKeyHash = await crypto.subtle.digest("SHA-256", encoder.encode(process.env.NEXT_PUBLIC_TELEGRAM_BOT_SECRET));
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

  const handleMintPkp = async () => {
    if (tgUser) {
      try {
        const minted = await mintPkp(tgUser.id.toString());
        console.log("minted", minted);
        setMintedPkp(minted!);
        console.log(minted);
      } catch (error) {
        console.error("Failed to mint PKP:", error);
        setValidationError("Failed to mint PKP. Please try again.");
      }
    }
  };

  // const handleTelegramResponse = useCallback(
  //   async (user: TelegramUser) => {
  //     console.log("Telegram auth response received:", user);
  //     if (user && typeof user === "object") {
  //       setTgUser(user);

  //       const minted = await mintPkp(user);
  //       console.log("minted", minted);
  //       setMintedPkp(minted!);

  //       const sessionSigs = await getPkpSessionSigs(user, minted!);
  //       console.log(sessionSigs);
  //       setPkpSessionSigs(sessionSigs);

  //       // const { isValid, isRecent } = await verifyTelegramUser(user);
  //       // if (!isValid || !isRecent) {
  //       //   setValidationError(!isValid ? "Failed to validate Telegram user info. Please try again." : "Authentication has expired. Please log in again.");
  //       // } else {
  //       //   setValidationError(null);
  //       // }
  //     } else {
  //       console.error("Invalid user data received:", user);
  //       setValidationError("Invalid user data received. Please try again.");
  //     }
  //   },
  //   [setTgUser, setMintedPkp, setPkpSessionSigs, setValidationError]
  // );

  const handleGetPkpSessionSigs = async () => {
    if (tgUser && mintedPkp) {
      try {
        const sessionSigs = await getPkpSessionSigs(tgUser, mintedPkp);
        console.log(sessionSigs);
        setPkpSessionSigs(sessionSigs);
      } catch (error) {
        console.error("Failed to get PKP session signatures:", error);
        setValidationError("Failed to get PKP session signatures. Please try again.");
      }
    }
  };

  const getMessages = useCallback(async () => {
    const { data, error } = await supabase.from("secrets").select("*").eq("wallet", address);
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      setMessages(data);
    } else {
      setMessages([]);
    }
  }, [address, setMessages]);

  const login = async () => {
    const accounts = await sdk?.connect();
    setAddress(accounts?.[0]);
    // const result = startLitClient();
    // setLit(result);
    if (webApp) {
      setData(webApp.initData);
      console.log(webApp.initData);
      isRecent(webApp.initData).then((isRecent) => {
        console.log(isRecent);
      });
    }
    router.push("/dashboard");
  };

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

  const mint = async () => {
    const litContracts = await connectToLitContracts(provider);
    setMintedPkp(litContracts);
  };

  const startLitClient = (): ILitNodeClient => {
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "datil-dev" });
    litNodeClient.connect();
    return litNodeClient as ILitNodeClient;
  };

  const viewMessage = async (ciphertext: string, dataToEncryptHash: string, type: string) => {
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: address,
        },
      },
    ];

    // const litNodeClient = await connectToLitNodes();
    // const result = await getSessionSignatures(litNodeClient, mintedPkp as MintedPkp, user?.id.toString() as string);
    // console.log(result);
    const sig = await getPkpSessionSigs(user as unknown as TelegramUser, mintedPkp as any);
    console.log(sig);
    // const decodedMessage = await decryptWithLit(lit as ILitNodeClient, ciphertext, dataToEncryptHash, accessControlConditions, "ethereum");
    // if (type === "file") {
    //   const uintArray = decodeb64(decodedMessage);
    //   const blob = new Blob([uintArray], { type: "image/png" });

    //   if (blob instanceof Blob) {
    //     const blobUrl = URL.createObjectURL(blob);
    //     setImage(blobUrl);
    //   }
    // }

    // return decodedMessage;
    return null;
  };

  const hideMessage = async (title: string, newMessage: string, type: string) => {
    if (newMessage && newMessage.length > 0) {
      const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: address,
          },
        },
      ];

      const { ciphertext, dataToEncryptHash } = await encryptWithLit(lit as ILitNodeClient, newMessage, accessControlConditions, "ethereum");

      const dataToSave = {
        title: title,
        ciphertext: ciphertext,
        dataToEncryptHash: dataToEncryptHash,
        type: type,
        wallet: address,
      };

      // TODO: Save data to the chain
      const { data, error } = await supabase.from("secrets").insert(dataToSave);
      if (error) {
        console.error(error);
      }
      getMessages();
    }
  };

  useEffect(() => {
    getMessages();
  }, [address, getMessages]);

  return <Web3Context.Provider value={{ login, mint, address, hideMessage, viewMessage, messages, image, setTgUser }}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
