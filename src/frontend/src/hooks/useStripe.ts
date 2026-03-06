import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ShoppingItem, StripeSessionStatus } from "../backend.d";
import { useActor } from "./useActor";

const PREMIUM_KEY = "muscleBuild_premium";

export function usePremiumStatus() {
  const [isPremium, setIsPremiumState] = useState<boolean>(() => {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  });

  function setPremium(value: boolean) {
    if (value) {
      localStorage.setItem(PREMIUM_KEY, "true");
    } else {
      localStorage.removeItem(PREMIUM_KEY);
    }
    setIsPremiumState(value);
  }

  return { isPremium, setPremium };
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: Array<ShoppingItem>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as { id?: string; url?: string };
      if (!session.url) {
        throw new Error("No checkout URL returned from Stripe");
      }
      return { id: session.id ?? "", url: session.url };
    },
  });
}

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StripeSessionStatus | null>({
    queryKey: ["stripeSessionStatus", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    refetchInterval: (query) => {
      // Stop polling once we have a completed/failed status
      const data = query.state.data;
      if (!data) return 2000;
      if (data.__kind__ === "completed" || data.__kind__ === "failed")
        return false;
      return 2000;
    },
  });
}
