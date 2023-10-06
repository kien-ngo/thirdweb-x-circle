"use server";

import { AUTH_STRING, CONTRACT_ADDRESS } from "@/src/consts";
import {
  getEntitySecretCipherText,
  getIdempotencyKey,
  getWallets,
} from "@/src/utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { TGeneratedWallet } from "./webhook_userCreated";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";

// Hard-coded. This should be generated dynamically from the contract's abi
const functionSignature =
  "claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: { message: "Method not allowed" },
    });
  }
  const { tokenId } = JSON.parse(req.body);
  console.log({ tokenId });
  // Todo: Validate tokenId

  try {
    // [Auth]
    const supabase = createPagesServerClient({ req, res });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      res.status(405).send("Unauthorized");
      return;
    }
    // console.log(user);

    const wallets: TGeneratedWallet[] = await getWallets();
    // console.log({ wallets });
    const wallet = wallets.find((item) => item.refId === user.id);
    if (!wallet || !wallet.address) throw Error("Could not fetch user wallet");
    // console.log(wallet);

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
            wallet.address, // receiver
            tokenId, // tokenId
            1, // quantity
            NATIVE_TOKEN_ADDRESS, // currency
            0, // pricePerToken
            [
              [
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ], // proof
              10, // quantityLimitPerWallet
              0, // pricePerToken
              NATIVE_TOKEN_ADDRESS, // currency
            ],
            "0x", // _data
          ],
          abiFunctionSignature: functionSignature,
          contractAddress: CONTRACT_ADDRESS,
          entitySecretCipherText,
          walletId: wallet.id,
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
    return res.json({ success: false, error: err });
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
