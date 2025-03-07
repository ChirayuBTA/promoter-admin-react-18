"use client";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

export const UserDropdown = () => {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 cursor-pointer">
        <User className="w-5 h-5 text-gray-700 dark:text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white dark:bg-gray-900">
        <div className="p-3 text-sm text-gray-700 dark:text-white">
          <p className="font-bold">{session?.user?.name || "Guest"}</p>
          <p className="text-xs text-gray-500">
            {session?.user?.role || "User"}
          </p>
        </div>

        <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 text-red-600 flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
