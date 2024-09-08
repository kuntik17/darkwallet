import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import { checkAndSignAuthMessage, ethConnect } from "@lit-protocol/lit-node-client";
import { AccessControlConditions, AuthSig, ILitNodeClient } from "@lit-protocol/types";

declare global {
  interface Window {
    [index: string]: any;
  }
}

export function encodeb64(uintarray: any) {
  const b64 = btoa(uintarray);
  return b64;
}

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.replace(/^data:(.*?);base64,/, "");
      resolve(base64Data);
    };
    reader.readAsDataURL(blob);
  });
}

export function decodeb64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const uintArray = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    uintArray[i] = binaryString.charCodeAt(i);
  }

  return uintArray;
}

export async function encryptWithLit(
  litNodeClient: ILitNodeClient,
  aStringThatYouWishToEncrypt: string,
  accessControlConditions: AccessControlConditions,
  chain: string
): Promise<{ ciphertext: string; dataToEncryptHash: string }> {
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      dataToEncrypt: aStringThatYouWishToEncrypt,
    },
    litNodeClient
  );

  return {
    ciphertext,
    dataToEncryptHash,
  };
}

export async function decryptWithLit(
  litNodeClient: ILitNodeClient,
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: AccessControlConditions,
  chain: string
): Promise<string> {
  ethConnect.disconnectWeb3();
  let authSig = await checkAndSignAuthMessage({
    chain,
    nonce: Date.now().toString(),
  });

  const decryptedString = await LitJsSdk.decryptToString(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
      chain: "ethereum",
    },
    litNodeClient
  );

  return decryptedString;
}
