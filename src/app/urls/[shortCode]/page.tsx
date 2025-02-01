"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { urlService } from "@/services/api/urls";
import { useQuery } from "@tanstack/react-query";

export default function RedirectPage({
  params,
}: {
  params: { shortCode: string };
}) {
  const router = useRouter();

  const { isLoading } = useQuery({
    queryKey: ["redirect", params.shortCode],
    queryFn: async () => {
      try {
        const response = await urlService.getOriginalUrl(params.shortCode);
        window.location.href = response.url;
        return response;
      } catch (error) {
        router.push("/404");
        throw error;
      }
    },

    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
