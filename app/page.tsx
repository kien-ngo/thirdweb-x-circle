"use client";

import { useSupabase } from "@/src/supabase/SupabaseProvider";

export default function Home() {
  const { session, supabase } = useSupabase();
  return (
    <>
      <div className="text-center text-3xl mt-20">Mint a free NFT</div>
      <img
        src="/thirdweb_logo.png"
        className="border rounded-lg p-6 mx-auto mt-10 shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)]"
        width={300}
        alt=""
      />
      {session ? (
        <button
          onClick={async () => {
            const res = await fetch("/api/claimEditionDrop").then((r) =>
              r.json()
            );
          }}
          className="border-2 mx-auto px-6 w-fit mt-10 py-4 rounded-full hover:border-pink-500"
        >
          Mint now
        </button>
      ) : (
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
      )}
    </>
  );
}
