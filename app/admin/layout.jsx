import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/AdminNavbar";

export const metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({ children }) {
  return (
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        <div className="flex flex-col w-full">
          {/* Navbar */}
          <Navbar />
          <main className="p-6 bg-gray-100 min-h-min">{children}</main>
        </div>
      </div>
  );
}
