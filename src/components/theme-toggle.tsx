"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-5 w-5 text-yellow-500" />
      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
      <Moon className="h-5 w-5 text-gray-900 dark:text-white" />
    </div>
  );
};
