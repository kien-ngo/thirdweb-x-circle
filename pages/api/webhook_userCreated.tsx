import { AUTH_STRING, CIRCLE_BASE_API_URL } from "@/src/consts";
import { getEntitySecretCipherText, getIdempotencyKey } from "@/src/utils/api";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: { message: "Method not allowed" },
    });
  }
  const body = req.body;
  const { id: userUid, email } = body.record;
  if (!userUid) return res.send("missing id");
  try {
    const [entitySecretCipherText, idempotencyKey] = await Promise.all([
      getEntitySecretCipherText(),
      getIdempotencyKey(),
    ]);
    const data: { data: { wallets: TGeneratedWallet[] } } = await fetch(
      `${CIRCLE_BASE_API_URL}/developer/wallets`,
      {
        method: "POST",
        headers: {
          Authorization: AUTH_STRING,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entitySecretCipherText,
          idempotencyKey,
          blockchains: ["AVAX-FUJI"], // Enable the wallet to be used on multiple chains or just one
          count: 1, // Only create 1 wallet for reach user
          walletSetId: process.env.WALLET_SET_ID,
        }),
      }
    )
      .then((r) => r.json())
      .catch((err) => console.log(err));
    const walletAddress = data.data.wallets[0].address;
    const walletId = data.data.wallets[0].id;
    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.PRIVATE_KEY!,
      "avalanche-fuji",
      { secretKey: process.env.THIRDWEB_SECRET_KEY }
    );

    await Promise.all([
      /**
       * [Demo only]: Send some testnet funds to the new wallet
       * For the demo purpose we are going to send to AVAX-FUJI only
       */
      sdk.wallet.transfer(walletAddress, "0.01"),
      // Update the refId of this wallet to the user's UID - mandatory
      // Since we need to know which wallet belong to which user
      fetch(`${CIRCLE_BASE_API_URL}/wallets/${walletId}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: AUTH_STRING,
        },
        body: JSON.stringify({
          name: email,
          refId: userUid,
        }),
      }),
    ]);

    return res.send("ok");
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

export type TGeneratedWallet = {
  id: string;
  state: string;
  walletSetId: string;
  custodyType: "DEVELOPER" | "USER";
  address: string;
  blockchain: "AVAX-FUJI" | "MATIC-MUMBAI" | "ETH-GOERLI";
  accountType: string; // "EOA"
  updateDate: string;
  createDate: string;
  refId?: string;
};
