import { queryOptions } from "@tanstack/react-query";
import { getWallet } from "@/lib/wallet.functions";
import { listMerchants } from "@/lib/merchants.functions";

export const walletQueryOptions = () =>
  queryOptions({
    queryKey: ["wallet"],
    queryFn: () => getWallet(),
    staleTime: 15_000,
  });

export const merchantsQueryOptions = () =>
  queryOptions({
    queryKey: ["merchants"],
    queryFn: () => listMerchants(),
    staleTime: 60_000,
  });
