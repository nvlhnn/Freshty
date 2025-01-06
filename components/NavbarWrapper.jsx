"use client"; // Client-side component

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function NavbarWrapper() {
  const pathname = usePathname(); // Get the current path
  const userType = pathname.includes("admin") ? "admin" : "user";

  return userType === "admin" ? null : <Navbar />;
}
