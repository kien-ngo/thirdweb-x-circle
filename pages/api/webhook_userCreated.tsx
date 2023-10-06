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

const apiResponseSample = {
  data: {
    wallets: [
      {
        id: "9268a331-ffc8-4fc6-a70e-958598254225",
        state: "LIVE",
        walletSetId: "018afe72-827b-76cc-b38d-aa24d4f3700b",
        custodyType: "DEVELOPER",
        address: "0xab1699626c3b64500e613b94333ff23c769bfe09",
        blockchain: "AVAX-FUJI",
        accountType: "EOA",
        updateDate: "2023-10-05T06:17:21Z",
        createDate: "2023-10-05T06:17:21Z",
      },
      {
        id: "cb974e6d-9d59-4546-8e60-13d2709cde6c",
        state: "LIVE",
        walletSetId: "018afe72-827b-76cc-b38d-aa24d4f3700b",
        custodyType: "DEVELOPER",
        address: "0xab1699626c3b64500e613b94333ff23c769bfe09",
        blockchain: "MATIC-MUMBAI",
        accountType: "EOA",
        updateDate: "2023-10-05T06:17:21Z",
        createDate: "2023-10-05T06:17:21Z",
      },
      {
        id: "63f3c94a-e421-499c-980a-a6711fc56716",
        state: "LIVE",
        walletSetId: "018afe72-827b-76cc-b38d-aa24d4f3700b",
        custodyType: "DEVELOPER",
        address: "0xab1699626c3b64500e613b94333ff23c769bfe09",
        blockchain: "ETH-GOERLI",
        accountType: "EOA",
        updateDate: "2023-10-05T06:17:21Z",
        createDate: "2023-10-05T06:17:21Z",
      },
    ],
  },
};

const supabaseBodySample = {
  type: "INSERT",
  table: "users",
  record: {
    id: "*****-****-****-****-****",
    aud: "authenticated",
    role: "",
    email: "******@gmail.com",
    phone: null,
    created_at: "2023-10-05T07:43:09.508055+00:00",
    deleted_at: null,
    invited_at: null,
    updated_at: "2023-10-05T07:43:09.508055+00:00",
    instance_id: "00000000-0000-0000-0000-000000000000",
    is_sso_user: false,
    banned_until: null,
    confirmed_at: null,
    email_change: "",
    phone_change: "",
    is_super_admin: null,
    recovery_token: "",
    last_sign_in_at: null,
    recovery_sent_at: null,
    raw_app_meta_data: { provider: "email", providers: [Array] },
    confirmation_token: "",
    email_confirmed_at: null,
    encrypted_password: "$2a$10$PGJr***************zhtRCjCXjr/u.",
    phone_change_token: "",
    phone_confirmed_at: null,
    raw_user_meta_data: {},
    confirmation_sent_at: null,
    email_change_sent_at: null,
    phone_change_sent_at: null,
    email_change_token_new: "",
    reauthentication_token: "",
    reauthentication_sent_at: null,
    email_change_token_current: "",
    email_change_confirm_status: 0,
  },
  schema: "auth",
  old_record: null,
};
