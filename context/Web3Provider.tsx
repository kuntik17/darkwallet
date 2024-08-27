"use client";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ILitNodeClient } from "@lit-protocol/types";

import { encryptWithLit, decryptWithLit, decodeb64 } from "@/lib/lit";
import supabase from "@/lib/supabase";

type Web3ContextType = {
  address: string | null;
  login: () => void;
  hideMessage: (title: string, newMessage: string, type: string) => void;
  viewMessage: (ciphertext: string, dataToEncryptHash: string, type: string) => void;
  messages: any[];
  image: string | null;
};

// Create a new context for the Web3 provider
export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Create a Web3 provider component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [lit, setLit] = useState<ILitNodeClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const ethProvider = window.ethereum;
        if (!ethProvider) {
          console.error("Ethereum provider not found");
          return;
        }
        const eth_address = await ethProvider.enable({
          method: "eth_requestAccounts",
        });
        if (eth_address.length > 0) {
          setAddress(eth_address[0]);
          const result = startLitClient();
          setLit(result);
          getMessages();
        }
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  const getMessages = async () => {
    const { data, error } = await supabase.from("secrets").select("*");
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      setMessages(data);
    } else {
      setMessages([]);
    }
  };

  const login = async () => {
    const ethProvider = window.ethereum;
    const eth_address = await ethProvider.enable({
      method: "eth_requestAccounts",
    });
    setAddress(eth_address[0]);
    const result = startLitClient();
    setLit(result);
    router.push("/dashboard");
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
    if (type === "file") {
      const uintArray = decodeb64(decodedMessage);
      const blob = new Blob([uintArray], { type: "image/png" });

      if (blob instanceof Blob) {
        const blobUrl = URL.createObjectURL(blob);
        setImage(blobUrl);
      }
    }

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

  return <Web3Context.Provider value={{ login, address, hideMessage, viewMessage, messages, image }}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
