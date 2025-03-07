import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
}

interface SelectDropdownProps {
  label: string;
  api: (params: {
    search: string;
    page: number;
    limit: number;
  }) => Promise<{ data: Option[] }>;
  selectedOption: Option | null;
  //   onSelect: (option: Option) => void;
}

const SelectDropdown = ({
  label,
  api,
  selectedOption,
}: //   onSelect,
SelectDropdownProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current]);

  const fetchOptions = async (query = "", pageNumber = 1) => {
    if (!hasMore && pageNumber > 1) return;
    setIsLoading(true);
    try {
      const response = await api({
        search: query,
        page: pageNumber,
        limit: 10,
      });
      const newOptions = response.data || [];
      if (pageNumber === 1) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }
      setHasMore(newOptions.length === 10);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchOptions(value, 1);
  };

  const handleScroll = () => {
    const div = listRef.current;
    if (!div) return;
    if (
      div.scrollTop + div.clientHeight >= div.scrollHeight - 10 &&
      hasMore &&
      !isLoading
    ) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchOptions(searchTerm, nextPage);
        return nextPage;
      });
    }
  };

  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            {selectedOption ? selectedOption.name : `Select ${label}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
        >
          <div className="p-2">
            <Input
              placeholder={`Search ${label}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="mb-2"
            />
          </div>
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto p-2"
          >
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.id}
                  className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                  //   onClick={() => onSelect(option)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="text-center p-2 text-gray-500">
                {isLoading ? "Loading..." : "No options found"}
              </div>
            )}
            {isLoading && options.length > 0 && (
              <div className="text-center p-2 text-gray-500">
                Loading more...
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectDropdown;
