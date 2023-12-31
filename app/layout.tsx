import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SupabaseProvider from "@/src/supabase/SupabaseProvider";
import Menu from "@/src/components/Menu";
import AuthComponent from "@/src/components/Auth";
import { TGeneratedWallet } from "@/pages/api/webhook_userCreated";
import WalletProvider from "@/src/components/WalletProvider";
import ThirdwebProviderWrapper from "@/src/components/ThirdwebProviderWrapper";
import { getWalletFromRefId } from "@/src/utils/api";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb x Circle",
  description:
    "Mint NFT from a thirdweb contract with programable wallet from Circle",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let wallet: TGeneratedWallet | undefined;
  if (session) wallet = await getWalletFromRefId(session.user.id);
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} flex flex-col pb-20`}>
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
