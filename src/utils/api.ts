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
  console.log('get wallet: ', data);
  const wallets: TGeneratedWallet[] = data.data.wallets;
  return wallets;
};

export const getTransaction = async (
  id: string,
  type: "OUTBOUND" | "INBOUND"
) => {
  const data = await fetch(
    `${CIRCLE_BASE_API_URL}/transactions/${id}?txType=${type}`,
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
  console.log(data);
  const transaction = data.data.transaction;
  return transaction;

  /*
      {
    "data": {
      "transaction": {
        "id": "5f59373c-bf12-590e-973d-ec86268c9333",
        "blockchain": "AVAX-FUJI",
        "walletId": "d15fb311-b298-4a74-9a57-6b065f1e3142",
        "sourceAddress": "0x52abf5fae2ba8e885afcd5b232897499ed692825",
        "contractAddress": "0x588e97e302f4bb047adadab6424d06d16ebd1370",
        "transactionType": "OUTBOUND",
        "custodyType": "DEVELOPER",
        "state": "COMPLETE",
        "amounts": null,
        "nfts": null,
        "txHash": "0x4c8c54ecf765b543f295c4f85c18e78d529fdf0ee4f799f441dc7290494fe263",
        "blockHash": "0x207e5f6073018ab19e90ea3217fc94e4b76d5c993307c7beeae99aa0cb32bc08",
        "blockHeight": 26502024,
        "networkFee": "0.00369659342",
        "firstConfirmDate": "2023-10-05T21:04:41Z",
        "operation": "CONTRACT_EXECUTION",
        "feeLevel": "MEDIUM",
        "estimatedFee": {
          "gasLimit": "164981",
          "baseFee": "25",
          "priorityFee": "4.485",
          "maxFee": "54.485"
        },
        "refId": "",
        "abiFunctionSignature": "claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)",
        "abiParameters": [
          "0x52abf5fae2ba8e885afcd5b232897499ed692825",
          0,
          1,
          "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          0,
          [
            [
              "0x0000000000000000000000000000000000000000000000000000000000000000"
            ],
            10,
            0,
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ],
          "0x"
        ],
        "createDate": "2023-10-05T21:04:21Z",
        "updateDate": "2023-10-05T21:04:41Z"
      }
    }
  }
    */
};

// Example for running out of gas
// {
//   "data": {
//     "transaction": {
//       "id": "230ba4bd-8bb0-58de-ac53-7c1707adf1fc",
//       "blockchain": "AVAX-FUJI",
//       "walletId": "d15fb311-b298-4a74-9a57-6b065f1e3142",
//       "sourceAddress": "0x52abf5fae2ba8e885afcd5b232897499ed692825",
//       "contractAddress": "0x588e97e302f4bb047adadab6424d06d16ebd1370",
//       "transactionType": "OUTBOUND",
//       "custodyType": "DEVELOPER",
//       "state": "FAILED",
//       "errorReason": "INSUFFICIENT_NATIVE_TOKEN",
//       "amounts": null,
//       "nfts": null,
//       "networkFee": "",
//       "operation": "CONTRACT_EXECUTION",
//       "feeLevel": "MEDIUM",
//       "estimatedFee": {
//         "gasLimit": "119817",
//         "baseFee": "25",
//         "priorityFee": "3.6",
//         "maxFee": "53.6"
//       },
//       "refId": "",
//       "abiFunctionSignature": "claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)",
//       "abiParameters": [
//         "0x52abf5fae2ba8e885afcd5b232897499ed692825",
//         0,
//         1,
//         "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//         0,
//         [
//           [
//             "0x0000000000000000000000000000000000000000000000000000000000000000"
//           ],
//           10,
//           0,
//           "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
//         ],
//         "0x"
//       ],
//       "createDate": "2023-10-05T22:29:50Z",
//       "updateDate": "2023-10-05T22:29:51Z"
//     }
//   }
// }
