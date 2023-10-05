"use client";

import { useSDK } from "@thirdweb-dev/react";
import { formatEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

export default function Balance({ walletAddress }: { walletAddress: string }) {
  const [balance, setBalance] = useState<string>("Loading...");
  const sdk = useSDK();
  useEffect(() => {
    if (!sdk) return;
    const get = async () => {
      const _balance = (
        await sdk.getProvider()?.getBalance(walletAddress)
      )?.toString();
      setBalance(_balance ? formatEther(_balance) : "N/A");
    };
    get();
  }, [sdk]);
  return (
    <li>
      <a>Balance: <b className="text-green-500">{balance} AVAX</b></a>
    </li>
  );
}
