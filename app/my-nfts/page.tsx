"use client";

import NftBalance from "@/src/components/NftBalance";
import { useCircleWallet } from "@/src/components/WalletProvider";
import { CONTRACT_ADDRESS } from "@/src/consts";
import { truncateEvmAddress } from "@/src/utils/truncateEvmAddress";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tokens = [
  {
    tokenId: 0,
    image: "/thirdweb_logo.png",
    shadow: "shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)]",
    hover: "border-pink-500",
    name: "thirdweb x Circle Edition Drop",
  },
  {
    tokenId: 1,
    image: "/circle_logo.png",
    shadow: "shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]",
    hover: "border-green-200",
    name: "Circle x thirdweb Edition Drop",
  },
];

export default function Page() {
  const { wallet } = useCircleWallet();
  if (!wallet)
    return <div className="text-center">Error: Wallet not found</div>;
  return (
    <>
      <div className="mt-10 text-center">
        Your wallet address:{" "}
        <button
          className="underline"
          onClick={async () => {
            await window.navigator.clipboard.writeText(wallet.address);
            toast("Address copied");
          }}
        >
          {truncateEvmAddress(wallet.address)}
        </button>
      </div>

      {tokens.map((item) => (
        <div
          key={item.tokenId}
          className="flex flex-row flex-wrap justify-center gap-6 mt-10"
        >
          <div
            className={`border flex w-[330px] h-[224px] rounded-lg ${item.shadow}`}
          >
            <img
              key={item.tokenId}
              src={item.image}
              className="object-contain h-[200px] w-auto m-auto"
              alt=""
            />
          </div>
          <div>
            <div>
              <span className="text-gray-500">Name</span>:{" "}
              <b className="text-lg">{item.name}</b>
            </div>
            <div>
              <span className="text-gray-500">Contract address: </span>
              <button
                className="underline"
                onClick={async () => {
                  await window.navigator.clipboard.writeText(CONTRACT_ADDRESS);
                  toast("Contract address copied");
                }}
              >
                {truncateEvmAddress(CONTRACT_ADDRESS)}
              </button>
            </div>
            <div>
              <span className="text-gray-500">Edition ID: </span>#{item.tokenId}
            </div>
            <div>
              You own:{" "}
              <b className="text-green-500 text-lg">
                <NftBalance
                  walletAddress={wallet.address}
                  tokenId={item.tokenId}
                />
              </b>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
