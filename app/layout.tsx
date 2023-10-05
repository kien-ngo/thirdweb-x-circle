import { createServerClient } from "@/src/supabase/supabase-server";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SupabaseProvider from "@/src/supabase/SupabaseProvider";
import Menu from "@/src/components/Menu";
import AuthComponent from "@/src/components/Auth";
import { TGeneratedWallet, authString } from "@/pages/api/webhook_userCreated";
import WalletProvider from "@/src/components/WalletProvider";
import ThirdwebProviderWrapper from "@/src/components/ThirdwebProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb x Circle",
  description:
    "Mint NFT from a thirdweb contract with programable wallet from Circle",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let wallet: TGeneratedWallet | undefined;
  if (session) {
    // console.log({ session });
    const refId = session.user.id;
    /**
     * Calling this endpoint is not efficient
     * Ideally we would need a way to get a wallet based on refId, but seems like Circle doesn't have such endpoint atm
     */
    const data = await fetch(
      `https://api.circle.com/v1/w3s/wallets?blockchain=AVAX-FUJI&walletSetId=${process.env.WALLET_SET_ID}&pageSize=50`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: authString,
        },
      }
    )
      .then((r) => r.json())
      .catch((err) => console.log(err));
    // console.log(data);
    const wallets: TGeneratedWallet[] = data.data.wallets;
    // console.log({ wallets });
    wallet = wallets.find((item) => item.refId === refId);
  }
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} flex flex-col`}>
        <SupabaseProvider session={session}>
          <WalletProvider wallet={wallet}>
            <ThirdwebProviderWrapper thirdwebSdkChainSlug="avalanche-fuji">
              <Menu session={session} />
              {children}
              {!session && <AuthComponent />}
            </ThirdwebProviderWrapper>
          </WalletProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
