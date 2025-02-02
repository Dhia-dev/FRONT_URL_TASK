"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlService } from "@/services/api/urls";
import Link from "next/link";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [url, setUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showQR, setShowQR] = useState(null);
  const limit = 5;
  const queryClient = useQueryClient();

  const { data: paginatedUrls } = useQuery({
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
  });

  const handleDelete = async (shortCode) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteUrlMutation.mutate(shortCode);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {}
  };

  const renderPaginationButtons = () => {
    if (!paginatedUrls) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-base rounded-md bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-base text-black">
          Page {currentPage} of {paginatedUrls?.totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, paginatedUrls?.totalPages || 1)
            )
          }
          disabled={currentPage === paginatedUrls?.totalPages}
          className="px-4 py-2 text-base rounded-md bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          Next
        </button>
      </div>
    );
  };

  const handleShowQR = (shortCode) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`;
    setShowQR(shortCode);
    Swal.fire({
      title: "QR Code",
      html: `
        <div class="flex flex-col items-center gap-4">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            fullUrl
          )}" 
               alt="QR Code" 
               class="max-w-full h-auto" />
          <p class="text-sm text-black">Scan to visit: ${fullUrl}</p>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-black mb-6">Create Short URL</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUrlMutation.mutate(url);
          }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black"
            required
            pattern="https?://.+"
          />
          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="w-full sm:w-auto px-6 py-3 text-base bg-black text-white hover:bg-gray-800 transition-colors rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            {createUrlMutation.isPending ? "Creating..." : "Shorten"}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        {paginatedUrls?.data.map((url) => (
          <div
            key={url.id}
            className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-black font-medium">Original URL :</p>
                <p className="text-base text-black truncate">
                  {url.originalUrl}
                </p>
              </div>
              <div>
                <p className="text-sm text-black font-medium">Short URL :</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_URL}/${url.shortCode}`}
                    target="_blank"
                    className="text-base text-black hover:text-gray-600 truncate"
                  >
                    {url.shortUrl}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(url.shortCode)}
                    className="p-2 hover:bg-gray-100 rounded relative group"
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
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
                  <button
                    onClick={() => handleShowQR(url.shortCode)}
                    className="p-2 hover:bg-gray-100 rounded relative group"
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      Show QR Code
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="text-sm text-black">
                Created: {new Date(url.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 bg-black text-white text-sm px-4 py-1.5 rounded-full shadow-md">
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
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded shadow-md"
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
