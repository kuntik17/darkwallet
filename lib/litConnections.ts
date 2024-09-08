import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, AuthMethodScope } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { litActionCode } from "./litAction";
import * as ethers from "ethers";
import Hash from "typestub-ipfs-only-hash";
import { LitAbility, LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";

export const connectToLitNodes = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: false,
  });
  await litNodeClient.connect();
  return litNodeClient;
};

export const connectToLitContracts = async (provider: any) => {
  await provider.send("eth_requestAccounts", []);
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  console.log("signer", signer);
  const litContracts = new LitContracts({
    signer,
    network: LitNetwork.DatilDev,
  });
  await litContracts.connect();

  const hash = await Hash.of(litActionCode);
  const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
  console.log("pkp", pkp);
  const permitted = await litContracts.addPermittedAction({
    authMethodScopes: [AuthMethodScope.SignAnything],
    pkpTokenId: pkp.tokenId,
    ipfsId: hash,
  });
  console.log(permitted, "permitted");
  return pkp;
};

export const getSessionSignatures = async (litNodeClient: LitNodeClient, pkp: any, telegramUser: string) => {
  const sessionSignatures = await litNodeClient.getPkpSessionSigs({
    pkpPublicKey: pkp.publicKey,
    litActionCode: Buffer.from(litActionCode).toString("base64"),
    jsParams: {
      telegramUserData: telegramUser,
      telegramBotSecret: process.env.NEXT_PUBLIC_TELEGRAM_BOT_SECRET,
      pkpTokenId: pkp.tokenId,
    },
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
  });
  console.log(`✅ Got PKP Session Sigs: ${JSON.stringify(sessionSignatures, null, 2)}`);
  return sessionSignatures;
};
