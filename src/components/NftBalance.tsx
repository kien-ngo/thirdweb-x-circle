import { useContract, useNFTBalance } from "@thirdweb-dev/react";
import { CONTRACT_ADDRESS } from "../consts";

export default function NftBalance({
  walletAddress,
  tokenId,
}: {
  walletAddress: string;
  tokenId: number;
}) {
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data, isLoading, error } = useNFTBalance(
    contract,
    walletAddress,
    tokenId
  );
  return <>{data ? `${data.toString()}` : ""}</>;
}
