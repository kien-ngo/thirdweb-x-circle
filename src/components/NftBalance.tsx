import { useContract, useNFTBalance } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../consts";

export default function NftBalance({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data, isLoading, error } = useNFTBalance(
    contract,
    walletAddress,
    "0"
  );
  return <>{data ? `${data.toString()}` : ""}</>;
}
