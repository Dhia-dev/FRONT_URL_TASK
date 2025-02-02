"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlService } from "@/services/api/urls";
import Link from "next/link";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  const queryClient = useQueryClient();
  interface PaginatedResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: UrlData[];
  }

  interface UrlData {
    id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    clicks: number;
    createdAt: string;
  }

  const { data: paginatedUrls } = useQuery<PaginatedResponse>({
    queryKey: ["urls", currentPage, limit],
    queryFn: () => urlService.getUserUrls(currentPage, limit),
    refetchInterval: 30000,
  });

  const createUrlMutation = useMutation({
    mutationFn: urlService.createShortUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      setUrl("");
      Swal.fire({
        title: "Success!",
        text: "URL has been shortened successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: "Failed to shorten URL",
        icon: "error",
        confirmButtonText: "OK",
      });
    },
  });

  const deleteUrlMutation = useMutation({
    mutationFn: urlService.deleteShortUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      Swal.fire({
        title: "Deleted!",
        text: "Your URL has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the URL.",
        icon: "error",
        confirmButtonText: "OK",
      });
    },
  });

  const handleDelete = async (shortCode: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteUrlMutation.mutate(shortCode);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(url);

      setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch (err) {}
  };
  const renderPaginationButtons = () => {
    if (!paginatedUrls) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md"
        >
          Previous
        </button>
        <span className="px-3 sm:px-4 py-2 text-sm sm:text-base">
          Page {currentPage} of {paginatedUrls?.totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, paginatedUrls?.totalPages || 1)
            )
          }
          disabled={currentPage === paginatedUrls?.totalPages}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20">
      {/* Section création d'URL */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Create Short URL
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUrlMutation.mutate(url);
          }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md"
            required
            pattern="https?://.+"
          />
          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="w-full sm:w-auto px-6 py-2 sm:py-2.5 text-sm sm:text-base"
          >
            {createUrlMutation.isPending ? "Creating..." : "Shorten"}
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {paginatedUrls?.data.map((url: any) => (
          <div
            key={url.id}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-500">Original URL</p>
                <p className="text-sm sm:text-base text-gray-800 truncate">
                  {url.originalUrl}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Short URL</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${url.shortCode}`}
                    target="_blank"
                    className="text-sm sm:text-base text-blue-600 hover:text-blue-800 truncate"
                  >
                    {url.shortUrl}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(url.shortCode)}
                    className="p-1 hover:bg-gray-100 rounded relative group"
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      Copy URL
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        copiedUrl === url.shortCode
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {copiedUrl === url.shortCode ? (
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
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="text-sm text-gray-500">
                Created: {new Date(url.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
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
                <button
                  onClick={() => handleDelete(url.shortCode)}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                  disabled={deleteUrlMutation.isPending}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      deleteUrlMutation.isPending ? "opacity-50" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {renderPaginationButtons()}
    </div>
  );
}
