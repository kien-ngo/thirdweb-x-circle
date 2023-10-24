import { executeContract } from "@/src/utils/api";
import { TGeneratedWallet } from "./webhook_userCreated";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { CONTRACT_ADDRESS } from "@/src/consts";

const functionSignature =
  "safeTransferFrom(address,address,uint256,uint256,bytes)";

  // this endpoint is not completed
export default async (req: NextApiRequest, res: NextApiResponse) => {
  //   if (req.method !== "POST") {
  //     res.status(405).json({
  //       success: false,
  //       error: { message: "Method not allowed" },
  //     });
  //   }
  //   const { tokenId, toAddress } = JSON.parse(req.body);

  // Todo: Validate tokenId

  try {
    // [Auth]
    // const supabase = createPagesServerClient({ req, res });
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // if (!user) {
    //   res.status(405).send("Unauthorized");
    //   return;
    // }
    // const wallets: TGeneratedWallet[] = await getWallets();
    // const wallet = wallets.find((item) => item.refId === user.id);
    // if (!wallet || !wallet.address) throw Error("Could not fetch user wallet");
    //   const abiParameters = [
    //     "0x52abf5fae2ba8e885afcd5b232897499ed692825", // from
    //     "0xab1699626c3b64500e613b94333ff23c769bfe09", // to
    //     0, // id (tokenId)
    //     1, // value (qty to transfer)
    //     "0x", // data
    //   ];
    //   const data = await executeContract(
    //     functionSignature,
    //     CONTRACT_ADDRESS,
    //     "d15fb311-b298-4a74-9a57-6b065f1e3142",
    //     abiParameters,
    //     "MEDIUM"
    //   );
    //   return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ success: false, error: err });
  }
};
