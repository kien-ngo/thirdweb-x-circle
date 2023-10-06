"use client";

import { usePathname } from "next/navigation";
import { MaybeSession, useSupabase } from "../supabase/SupabaseProvider";
import NativeBalance from "./NativeBalance";
import { truncateEvmAddress } from "../utils/truncateEvmAddress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCircleWallet } from "./WalletProvider";

export default function Menu({ session }: { session: MaybeSession }) {
  const { wallet } = useCircleWallet();
  const pathname = usePathname();
  const { supabase } = useSupabase();
  return (
    <>
      <div className="shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)] mx-auto mt-6 px-6 flex flex-row justify-between lg:w-[800px] w-[96vw] border-2 rounded-3xl h-16">
        <div className="my-auto lg:text-2xl">thirdweb x Circle</div>
        <div className="my-auto flex flex-row gap-6">
          {pathname !== "/" && (
            <a href="/" className="hover:text-pink-500">
              Mint now
            </a>
          )}
          {session ? (
            <>
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="m-1 cursor-pointer hover:text-pink-500"
                >
                  Account
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-6"
                >
                  {wallet && (
                    <>
                      <NativeBalance walletAddress={wallet.address} />
                      <li
                        onClick={async () => {
                          await window.navigator.clipboard.writeText(
                            wallet.address
                          );
                          toast("Address copied");
                        }}
                      >
                        <a>Address: {truncateEvmAddress(wallet.address)}</a>
                      </li>
                      <li>
                        <a href="/my-nfts">My NFTs</a>
                      </li>
                    </>
                  )}
                  <li>
                    <a
                      role="button"
                      className="text-red-500"
                      onClick={() => supabase.auth.signOut()}
                    >
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                const modal = document.getElementById(
                  "auth_modal"
                ) as HTMLDialogElement;
                if (!modal) return alert("Error: No auth modal found");
                modal.showModal();
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
