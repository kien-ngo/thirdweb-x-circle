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

// export const getWallets = async (): Promise<TGeneratedWallet[]> => {
//   const data = await fetch(
//     `${CIRCLE_BASE_API_URL}/wallets?blockchain=AVAX-FUJI&walletSetId=${process.env.WALLET_SET_ID}&pageSize=50`,
//     {
//       method: "GET",
//       headers: {
//         accept: "application/json",
//         authorization: AUTH_STRING,
//       },
//     }
//   )
//     .then((r) => r.json())
//     .catch((err) => console.log(err));
//   const wallets: TGeneratedWallet[] = data.data.wallets ?? [];
//   return wallets;
// };

export const getWalletFromRefId = async (
  refId: string
): Promise<TGeneratedWallet | undefined> => {
  if (!refId) return undefined;
  const data = await fetch(
    `${CIRCLE_BASE_API_URL}/wallets?blockchain=AVAX-FUJI&walletSetId=${process.env.WALLET_SET_ID}&pageSize=1&refId=${refId}`,
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
  const wallets: TGeneratedWallet[] = data.data.wallets ?? [];
  return wallets[0] || undefined;
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

export const executeContract = async (
  functionSignature: string,
  contractAddress: string,
  walletId: string,
  abiParameters: Array<
    string | number | string[] | number[] | Array<string | number>
  >,
  feeLevel: "HIGH" | "MEDIUM" | "LOW"
) => {
  const [entitySecretCipherText, idempotencyKey] = await Promise.all([
    getEntitySecretCipherText(),
    getIdempotencyKey(),
  ]);
  const data = await fetch(
    "https://api.circle.com/v1/w3s/developer/transactions/contractExecution",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: AUTH_STRING,
      },
      body: JSON.stringify({
        feeLevel: feeLevel,
        abiParameters: abiParameters,
        abiFunctionSignature: functionSignature,
        contractAddress: contractAddress,
        entitySecretCipherText,
        walletId: walletId,
        idempotencyKey,
      }),
    }
  )
    .then((r) => r.json())
    .catch((err) => console.log(err));
  return data;
};
