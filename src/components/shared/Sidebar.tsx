"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Settings,
  Users,
  ChevronRight,
  ChevronDown,
  Book,
  LetterText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/Images/DirectX-Logo.png";

type SidebarItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SidebarItem[];
};

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Users",
    icon: Users,
    subItems: [
      { name: "All Users", href: "/users", icon: Users },
      { name: "Admins", href: "/admins", icon: Users },
    ],
  },
  {
    name: "Reports",
    icon: Book,
    subItems: [{ name: "Reports", href: "#", icon: Users }],
  },
  {
    name: "Forms",
    icon: LetterText,
    subItems: [
      { name: "Brand", href: "/brands", icon: Users },
      { name: "Project", href: "/projects", icon: Users },
      { name: "Vendor", href: "/vendors", icon: Users },
      { name: "Promoter", href: "#", icon: Users },
      { name: "City", href: "#", icon: Users },
      { name: "Area", href: "#", icon: Users },
      { name: "Activity Location", href: "#", icon: Users },
      { name: "Activity Type", href: "#", icon: Users },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 h-screen bg-gray-100 dark:bg-gray-900 p-4 overflow-y-scroll no-scrollbar">
      <div className="mb-4 p-2">
        <Image src={logo} alt="DirectX" className="" />
      </div>
      <nav>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name} className="mb-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <item.icon className="w-5 h-5 text-gray-700 dark:text-white" />
                  {item.name}
                </Link>
              ) : (
                <button
                  onClick={() => toggleGroup(item.name)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-gray-700 dark:text-white" />
                    {item.name}
                  </div>
                  {openGroups[item.name] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}

              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openGroups[item.name] ? "auto" : 0,
                  opacity: openGroups[item.name] ? 1 : 0,
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden ml-6"
              >
                {openGroups[item.name] &&
                  item.subItems?.map((subItem) => (
                    <li key={subItem.name} className="mb-2">
                      <Link
                        href={subItem.href!}
                        className="flex items-center gap-2 p-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
              </motion.ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
