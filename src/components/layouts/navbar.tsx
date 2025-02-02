"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-300"
            >
              URL Shortener
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-base text-gray-700">
                Welcome, <span className="font-semibold">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="bg-gray-900 text-white px-4 py-2 text-base rounded-md shadow-md hover:shadow-lg hover:bg-gray-800 transition-all duration-300"
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
