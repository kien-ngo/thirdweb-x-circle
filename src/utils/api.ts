import { TGeneratedWallet } from "@/pages/api/webhook_userCreated";

export const AUTH_STRING = `Bearer ${process.env.CIRCLE_API_KEY}`;
export const CIRCLE_BASE_API_URL = "https://api.circle.com/v1/w3s";

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
