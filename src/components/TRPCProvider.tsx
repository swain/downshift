"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient, trpc, trpcClient } from "../utils/trpc";

interface TRPCProviderProps {
  children: ReactNode;
}

export const TRPCProvider = ({ children }: TRPCProviderProps) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
