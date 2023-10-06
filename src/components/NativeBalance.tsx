"use client";

import { useSDK } from "@thirdweb-dev/react";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { useEffect, useState } from "react";

export default function NativeBalance({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [balance, setBalance] = useState<string>("");
  const sdk = useSDK();

  // @thirdweb-dev/react doesn't have a hook for this yet
  useEffect(() => {
    if (!sdk) return;
    const get = async () => {
      const data = await sdk.getBalance(walletAddress);
      if (data) {
        const floatBalance = formatUnits(data.value, data.decimals);
        const formattedBalance = parseFloat(floatBalance).toFixed(3);
        setBalance(formattedBalance);
      } else {
        setBalance("N/A");
      }
    };
    get();
  }, [sdk]);
  return (
    <li>
      <a>
        Balance:{" "}
        <b className="text-green-500">
          {balance ? `${balance} AVAX` : "Loading..."}
        </b>
      </a>
    </li>
  );
}
