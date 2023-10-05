import { AUTH_STRING, CONTRACT_ADDRESS } from "@/src/consts";
import { createServerClient } from "@/src/supabase/supabase-server";
import { getEntitySecretCipherText, getIdempotencyKey } from "@/src/utils/api";
import { NextApiRequest, NextApiResponse } from "next";

// Hard-coded. This should be generated dynamically from the contract's abi
const functionSignature =
  "claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // [Auth]
    // const supabase = createServerClient();
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // if (!user) {
    //   res.status(405).send("Unauthorized");
    //   return;
    // }
    const [entitySecretCipherText, idempotencyKey] = await Promise.all([
      getEntitySecretCipherText(),
      getIdempotencyKey(),
    ]);

    console.log({ entitySecretCipherText, idempotencyKey });
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
          feeLevel: "MEDIUM",
          abiParameters: [
            "0x52abf5fae2ba8e885afcd5b232897499ed692825", // receiver
            0, // tokenId
            1, // quantity
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // currency
            0, // pricePerToken
            [
              [
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ], // proof
              10, // quantityLimitPerWallet
              0, // pricePerToken
              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // currency
            ],
            "0x", // _data
          ],
          abiFunctionSignature: functionSignature,
          contractAddress: CONTRACT_ADDRESS,
          entitySecretCipherText,
          walletId: "d15fb311-b298-4a74-9a57-6b065f1e3142", // hard-coded for testing
          idempotencyKey,
        }),
      }
    ).then((r) => r.json());
    // let data_sample = {
    //   data: {
    //     id: "5f59373c-bf12-590e-973d-ec86268c9333",
    //     state: "INITIATED",
    //   },
    // };
    console.log("Mint transaction");
    console.log(data);
    const circleTxId = data.data.id;
    return res.json({ success: true, circleTxId });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

/**
 * [
      'address',
      'tokenId',
      'uint256',
      'address',
      'uint256',
      '[[bytes32, bytes32, bytes32], uint256, uint256, address]',
      'bytes'
    ]
 */
