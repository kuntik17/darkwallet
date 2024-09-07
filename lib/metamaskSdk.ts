// app/utils/metamaskSdk.ts
import { MetaMaskSDK } from "@metamask/sdk";

const options = {
  injectProvider: true, // Injects the provider for you automatically
  communicationLayerPreference: "socket", // Choose communication layer (optional)
};

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Dark Wallet",
    url: "https://darkwallet-vmrt.vercel.app/",
  },
});
const ethereum = MMSDK.getProvider(); // This is the same as `window.ethereum`

export default ethereum;
