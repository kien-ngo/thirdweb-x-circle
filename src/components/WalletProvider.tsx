"use client";

import { TGeneratedWallet } from "@/pages/api/webhook_userCreated";
import { ReactNode, createContext, useContext } from "react";

type WalletContext = {
  wallet: TGeneratedWallet | undefined;
};
const Context = createContext<WalletContext | undefined>(undefined);

export default function WalletProvider({
  children,
  wallet,
}: {
  children: ReactNode;
  wallet: TGeneratedWallet | undefined;
}) {
  return (
    <Context.Provider value={{ wallet }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useCircleWallet = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useCircleWallet must be used inside WalletProvider");
  }
  return context;
};
