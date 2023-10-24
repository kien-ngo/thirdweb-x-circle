import { CONTRACT_ADDRESS } from "@/src/consts";
import { executeContract, getWalletFromRefId } from "@/src/utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
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
    const wallet = await getWalletFromRefId(user.id);
    if (!wallet || !wallet.address) throw Error("Could not fetch user wallet");
    const abiParameters = [
      wallet.address, // receiver
      tokenId, // tokenId
      1, // quantity
      NATIVE_TOKEN_ADDRESS, // currency
      0, // pricePerToken
      [
        ["0x0000000000000000000000000000000000000000000000000000000000000000"], // proof
        10, // quantityLimitPerWallet
        0, // pricePerToken
        NATIVE_TOKEN_ADDRESS, // currency
      ],
      "0x", // _data
    ];
    const data = await executeContract(
      functionSignature,
      CONTRACT_ADDRESS,
      wallet.id,
      abiParameters,
      "MEDIUM"
    );
    const circleTxId = data.data.id;
    return res.json({ success: true, circleTxId });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, error: err });
  }
};
