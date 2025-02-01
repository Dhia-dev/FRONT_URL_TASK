"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlService } from "@/services/api/urls";
import Link from "next/link";
export default function DashboardPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const queryClient = useQueryClient();

  const { data: urls = [] } = useQuery({
    queryKey: ["urls"],
    queryFn: urlService.getUserUrls,
    refetchInterval: 30000,
  });

  const createUrlMutation = useMutation({
    mutationFn: urlService.createShortUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      setUrl("");
    },
  });
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);

      setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Create Short URL
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUrlMutation.mutate(url);
          }}
          className="flex gap-4"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {createUrlMutation.isPending ? "Creating..." : "Shorten"}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        {urls.map((url: any) => (
          <div key={url.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Original URL</p>
                <p className="text-gray-800 truncate">{url.originalUrl}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Short URL</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={url.shortUrl}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {url.shortUrl}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(url.shortUrl)}
                    className="p-1 hover:bg-gray-100 rounded relative group"
                  >
                    {copiedUrl === url.shortUrl ? (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs">
                        Copied!
                      </div>
                    ) : (
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                        Copy URL
                      </div>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        copiedUrl === url.shortUrl
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {copiedUrl === url.shortUrl ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Created: {new Date(url.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {url.clicks} clicks
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
