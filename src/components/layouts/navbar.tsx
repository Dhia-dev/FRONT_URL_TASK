"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-lg sm:text-xl font-bold text-gray-800"
            >
              URL Shortener
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-700">
                Welcome, <span className="font-semibold">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
