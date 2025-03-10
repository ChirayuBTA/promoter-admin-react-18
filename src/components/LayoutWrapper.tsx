"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showLayout = pathname !== "/"; // Hide sidebar and navbar on "/"

  return showLayout ? (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar pageTitle="Dashboard" />
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  ) : (
    <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-800">{children}</main>
  );
}
