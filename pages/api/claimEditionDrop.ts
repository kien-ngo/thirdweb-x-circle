import { createServerClient } from "@/src/supabase/supabase-server";
import {
  AUTH_STRING,
  getEntitySecretCipherText,
  getIdempotencyKey,
} from "@/src/utils/api";
import { parseEther } from "ethers/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

const CONTRACT_ADDRESS = "0x588E97e302F4bB047aDAdAB6424d06D16ebd1370"; // Change this to your own contract address

// Hard-coded. This should be generated dynamically from the contract's abi
const functionSignature =
  "claim(address,uint256,uint256,address,uint256,((bytes32[],uint256,uint256,address)),bytes)";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // if (req.method !== "POST") {
  //   res.status(405).json({
  //     success: false,
  //     error: { message: "Method not allowed" },
  //   });
  // }

  // [Auth]
  // const supabase = createServerClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // if (!user) {
  //   res.status(405).send("Unauthorized");
  //   return;
  // }

  try {
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
            "0x52abf5fae2ba8e885afcd5b232897499ed692825",
            0,
            1,
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            0,
            JSON.stringify({
              proof: [
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ],
              quantityLimitPerWallet: 10,
              pricePerToken: 0,
              currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            }),
            "0x",
          ],
          abiFunctionSignature: functionSignature,
          contractAddress: CONTRACT_ADDRESS,
          entitySecretCipherText,
          walletId: "d15fb311-b298-4a74-9a57-6b065f1e3142",
          idempotencyKey,
        }),
      }
    ).then((r) => r.json());
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};
