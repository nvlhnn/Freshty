'use client';

import { useAuth } from "@/context/AuthContext";

export default function AdminNavbar() {
  const { logout } = useAuth();
  return (
    <div className="bg-white shadow-md py-3 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Branding */}
      <h1 className="text-xl font-bold text-green-prime"></h1>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Add optional actions, e.g., logout button */}
        <button
          className="text-gray-700 hover:text-green-prime"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
