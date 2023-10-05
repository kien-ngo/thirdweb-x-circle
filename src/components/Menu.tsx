"use client";

import { MaybeSession, useSupabase } from "../supabase/SupabaseProvider";
import Balance from "./Balance";
import { useCircleWallet } from "./WalletProvider";

export default function Menu({ session }: { session: MaybeSession }) {
  const { wallet } = useCircleWallet();
  // console.log({ wallet });
  const { supabase } = useSupabase();
  return (
    <div className="shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)] mx-auto mt-10 px-6 flex flex-row justify-between lg:w-[800px] w-[90vw] border-2 rounded-3xl h-16">
      <div className="my-auto lg:text-2xl">thirdweb x Circle</div>
      <div className="my-auto flex flex-row gap-6">
        {session ? (
          <>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn m-1 cursor-pointer">
                Account
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                {wallet && <Balance walletAddress={wallet.address} />}
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
  );
}
