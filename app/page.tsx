"use client";

import { useSupabase } from "@/src/supabase/SupabaseProvider";
import { truncateEvmAddress } from "@/src/utils/truncateEvmAddress";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tokens = [
  {
    tokenId: 0,
    image: "/thirdweb_logo.png",
    shadow: "shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)]",
    hover: "border-pink-500",
  },
  {
    tokenId: 1,
    image: "/circle_logo.png",
    shadow: "shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]",
    hover: "border-green-200",
  },
];

export default function Home() {
  const { session, supabase } = useSupabase();
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [tokenId, setTokenId] = useState<number>(0);
  const boxShadow = tokens.find((i) => i.tokenId === tokenId)?.shadow ?? "";
  const hoverColor = tokens.find((i) => i.tokenId === tokenId)?.hover ?? "";
  return (
    <>
      <div className="text-center text-3xl mt-20">Mint a free NFT</div>
      <div className="tabs tabs-boxed w-fit mx-auto mt-4">
        {tokens.map((item) => (
          <a
            key={item.tokenId}
            className={`tab ${item.tokenId === tokenId ? "tab-active" : ""}`}
            onClick={() => setTokenId(item.tokenId)}
          >
            #{item.tokenId + 1}
          </a>
        ))}
      </div>
      <div
        className={`border border-gray-600 flex w-[330px] h-[224px] rounded-lg mx-auto mt-10 ${boxShadow}`}
      >
        {tokens.map((item) => (
          <img
            key={item.tokenId}
            src={item.image}
            className={`${
              item.tokenId !== tokenId ? "hidden" : ""
            } object-contain h-[200px] w-auto m-auto`}
            alt=""
          />
        ))}
      </div>
      {session ? (
        <>
          <button
            onClick={async () => {
              setIsMinting(true);
              setTxHash("");
              const res = await fetch("/api/claimEditionDrop", {
                method: "POST",
                body: JSON.stringify({ tokenId }),
              })
                .then((r) => r.json())
                .catch((err) => console.log(err));
              // console.log({ res });
              if (!res.success) {
                return toast(res.message ?? "Error");
              }
              const { circleTxId } = res;
              // console.log({ circleTxId });
              // Fetch the transaction hash on the blockchain and return to front-end
              const loop = setInterval(async () => {
                const transaction = await fetch("/api/getTransaction", {
                  method: "POST",
                  body: JSON.stringify({ id: circleTxId, type: "OUTBOUND" }),
                })
                  .then((r) => r.json())
                  .catch((err) => console.log(err));
                // console.log("transaction client");
                // console.log(transaction);
                if (transaction.txHash) {
                  clearInterval(loop);
                  setTxHash(transaction.txHash);
                  setIsMinting(false);
                  toast("Mint transaction sent!");
                } else if (transaction.state === "FAILED") {
                  clearInterval(loop);
                  setIsMinting(false);
                  if (transaction.errorReason === "INSUFFICIENT_NATIVE_TOKEN") {
                    toast("FAILED: Not enough gas for transaction");
                  }
                }
              }, 1200);
            }}
            className={`border-2 mx-auto mt-10 py-4 rounded-full hover:${hoverColor} w-40`}
          >
            {isMinting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Mint now"
            )}
          </button>
          {txHash && (
            <div className="border border-gray-500 rounded-2xl mx-auto mt-10 lg:w-[600px] max-w-[95vw] p-8">
              <div className="flex flex-row justify-between">
                <div className="text-green-500">Transaction sent!</div>
                <button
                  className="font-bold underline"
                  onClick={() => setTxHash("")}
                >
                  Close
                </button>
              </div>
              <div>Transaction hash: {truncateEvmAddress(txHash)}</div>
              <div>
                <a
                  target="_blank"
                  href={`https://testnet.snowtrace.io/tx/${txHash}`}
                  className="underline"
                >
                  View on Explorer
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {" "}
          <button
            onClick={() => {
              const modal = document.getElementById(
                "auth_modal"
              ) as HTMLDialogElement;
              if (!modal) return alert("Error: No auth modal found");
              modal.showModal();
            }}
            className="border-2 mx-auto px-6 w-fit mt-10 py-4 rounded-full hover:border-pink-500"
          >
            Sign in to mint
          </button>
          <div className="text-center mt-6">
            You will be airdropped <u>0.01 AVAX</u> upon sign up
          </div>
        </>
      )}
    </>
  );
}
