"use client";

import NftBalance from "@/src/components/NftBalance";
import { useCircleWallet } from "@/src/components/WalletProvider";
import { CONTRACT_ADDRESS } from "@/src/consts";
import { truncateEvmAddress } from "@/src/utils/truncateEvmAddress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

      <div className="flex flex-row flex-wrap justify-center gap-6 mt-10">
        <img
          src="/thirdweb_logo.png"
          className="border rounded-lg p-6 shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)]"
          width={300}
          alt=""
        />
        <div>
          <div>
            Name: <b className="text-lg">thirdweb x Circle Edition Drop</b>
          </div>
          <div>
            Contract address:{" "}
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
          <div>Edition ID: #0</div>
          <div>
            You own:{" "}
            <b className="text-green-500 text-lg">
              <NftBalance walletAddress={wallet.address} />
            </b>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
