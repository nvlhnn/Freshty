import { FiBox, FiHome, FiArchive } from "react-icons/fi";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="bg-green-secondary h-screen w-64 shadow-md flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-green-prime">Admin Panel</h1>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link
              href="/admin/"
              className="flex items-center text-gray-700 hover:text-green-prime hover:bg-green-secondary-light px-4 py-2 rounded-md"
            >
              <FiHome className="mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/warehouses"
              className="flex items-center text-gray-700 hover:text-green-prime hover:bg-green-secondary-light px-4 py-2 rounded-md"
            >
              <FiBox className="mr-2" />
              Warehouses
            </Link>
          </li>
          <li>
            <Link
              href="/admin/products"
              className="flex items-center text-gray-700 hover:text-green-prime hover:bg-green-secondary-light px-4 py-2 rounded-md"
            >
              <FiArchive className="mr-2" />
              Products
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
