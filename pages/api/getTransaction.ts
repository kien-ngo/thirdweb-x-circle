import { getTransaction } from "@/src/utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { TGeneratedWallet } from "./webhook_userCreated";

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TGeneratedWallet>
) => {
  const { id, type } = JSON.parse(req.body);
  const transaction = await getTransaction(id, type);
  return res.json(transaction);
};
