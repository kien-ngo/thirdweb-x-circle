"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ReactNode } from "react";

export default function ThirdwebProviderWrapper({
  thirdwebSdkChainSlug,
  children,
}: {
  thirdwebSdkChainSlug: string;
  children: ReactNode;
}) {
  return (
    <ThirdwebProvider
      activeChain={thirdwebSdkChainSlug}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_API_KEY}
    >
      {children}
    </ThirdwebProvider>
  );
}
