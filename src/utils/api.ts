import { TGeneratedWallet } from "@/pages/api/webhook_userCreated";
import { AUTH_STRING, CIRCLE_BASE_API_URL } from "../consts";

export const getPublicKey = async () => {
  const {
    data: { publicKey: _publicKey },
  } = await fetch(`${CIRCLE_BASE_API_URL}/config/entity/publicKey`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_STRING,
    },
  })
    .then((r) => r.json())
    .catch((err) => console.log(err));
  return _publicKey;
};

export const getEntitySecretCipherText = async () => {
  const _publicKey = await getPublicKey();
  const forge = require("node-forge");
  const entitySecret = forge.util.hexToBytes(process.env.ENTITY_SECRET);
  const publicKey = forge.pki.publicKeyFromPem(_publicKey);
  const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  const entitySecretCipherText = forge.util.encode64(encryptedData);
  return entitySecretCipherText;
};

export const getIdempotencyKey = async () => {
  const crypto = await import("node:crypto");
  const uuid = crypto.randomUUID();
  return uuid;
};

/**
 * This is currently used to fetch a list of wallets from Circle DB and use the list
 * to filter out the user's wallet based on their user ID (provided from the Auth provider, in this case, Supabase)
 *
 * Calling this endpoint is not efficient
 * Ideally we would need a way to get a wallet based on refId, but seems like Circle doesn't have such endpoint atm
 * Other solution is to keep a separate record of that in the database (Supabase, for example)
 * but it is not as clean as using the mentioned endpoint - Supabase should just be used for Auth, this
 * way you can use the app for any auth provider
 */
export const getWallets = async () => {
  const data = await fetch(
    `${CIRCLE_BASE_API_URL}/wallets?blockchain=AVAX-FUJI&walletSetId=${process.env.WALLET_SET_ID}&pageSize=50`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: AUTH_STRING,
      },
    }
  )
    .then((r) => r.json())
    .catch((err) => console.log(err));
  const wallets: TGeneratedWallet[] = data.data.wallets;
  return wallets;
};

export const getTransaction = async (
  id: string,
  type: "OUTBOUND" | "INBOUND"
) => {
  const _type = type ? `?txType=${type}` : "";
  const data = await fetch(
    `${CIRCLE_BASE_API_URL}/transactions/${id}${_type}`,
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: AUTH_STRING,
      },
    }
  )
    .then((r) => r.json())
    .catch((err) => console.log(err));
  const transaction = data.data.transaction;
  return transaction;
};
