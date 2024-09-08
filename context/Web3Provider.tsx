"use client";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ILitNodeClient } from "@lit-protocol/types";

import { encryptWithLit, decryptWithLit, decodeb64 } from "@/lib/lit";
import supabase from "@/lib/supabase";

import { TelegramUser } from "@/types/types";
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
  const { initData } = useTelegram();
  const [lit, setLit] = useState<ILitNodeClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mintedPkp, setMintedPkp] = useState<MintedPkp | null>(null);
  const [data, setData] = useState<any>(null);
  const [sessionSignatures, setSessionSignatures] = useState<PkpSessionSigs | null>(null);

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
    router.push("/dashboard");
  };

  const mint = async () => {
    const pkp = await connectToLitContracts(provider);
    setMintedPkp(pkp);
    setData(initData);
  };

  const getSS = async () => {
    const litNodeClient = await connectToLitNodes();
    const sessionSignatures = await getSessionSignatures(litNodeClient, mintedPkp as MintedPkp, data);
    console.log(sessionSignatures);
    setSessionSignatures(sessionSignatures);
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

    const decodedMessage = await decryptWithLit(lit as ILitNodeClient, ciphertext, dataToEncryptHash, accessControlConditions, "ethereum");
    // if (type === "file") {
    //   const uintArray = decodeb64(decodedMessage);
    //   const blob = new Blob([uintArray], { type: "image/png" });

    //   if (blob instanceof Blob) {
    //     const blobUrl = URL.createObjectURL(blob);
    //     setImage(blobUrl);
    //   }
    // }

    return decodedMessage;
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
