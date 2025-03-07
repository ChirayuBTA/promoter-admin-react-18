import { ThemeToggle } from "./theme-toggle";
import { UserDropdown } from "./ui/user-dropdown";

export const Navbar = ({ pageTitle }: { pageTitle: string }) => {
  return (
    <nav className="w-full flex items-center justify-end p-4 bg-[#f5f5f5] dark:bg-gray-900 shadow-md">
      {/* <div className="text-lg font-bold text-gray-800 dark:text-white">
        Company Logo
      </div> */}
      {/* <div className="text-md font-semibold text-gray-700 dark:text-gray-200">
        {pageTitle}
      </div> */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </nav>
  );
};
