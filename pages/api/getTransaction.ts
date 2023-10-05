import { getTransaction } from "@/src/utils/api";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, type } = JSON.parse(req.body);
  const transaction = await getTransaction(id, type);
  console.log("transaction");
  console.log(transaction);
  return res.json(transaction);
};
