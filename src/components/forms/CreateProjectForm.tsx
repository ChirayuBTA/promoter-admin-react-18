"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import DatePicker from "../DatePicker";

interface ValidationErrors {
  name?: string;
  brand?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface Brand {
  id: string;
  name: string;
}

const CreateProjectForm = ({
  initialData,
  onClose,
}: {
  initialData?: any;
  onClose: () => void;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Brand selection state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  // Separate state for start date and end date
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const brandsListRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ICreateProjectBody>({
    name: "",
    brand: "",
    startDate: null,
    endDate: null,
    description: "",
    createdBy: initialData ? initialData.createdBy : session?.user?.id,
    updatedBy: initialData ? session?.user?.id : "",
  });

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current]);

  // Fetch brands with pagination and search
  const fetchBrands = async (query = "", pageNumber = 1) => {
    if (!hasMore && pageNumber > 1) return;

    setIsLoadingBrands(true);
    try {
      const response = await api.brand.getBrands({
        search: query,
        page: pageNumber,
        limit: 10,
      });

      const newBrands = response.data || [];

      if (pageNumber === 1) {
        setBrands(newBrands);
      } else {
        setBrands((prev) => [...prev, ...newBrands]);
      }

      setHasMore(newBrands.length === 10); // Assuming 10 is the limit
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Load initial brands
  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle brand search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchBrands(value, 1);
  };

  // Handle scroll for infinite loading
  const handleBrandsScroll = () => {
    const div = brandsListRef.current;
    if (!div) return;

    if (
      div.scrollTop + div.clientHeight >= div.scrollHeight - 10 &&
      hasMore &&
      !isLoadingBrands
    ) {
      console.log("Fetching more brands...");
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBrands(searchTerm, nextPage);
    }
  };

  // Prefill the form when initialData is available
  useEffect(() => {
    if (initialData) {
      // Parse dates if they exist in initialData
      if (initialData.startDate) {
        const startDateObj = new Date(initialData.startDate);
        setStartDate(startDateObj);
      }

      if (initialData.endDate) {
        const endDateObj = new Date(initialData.endDate);
        setEndDate(endDateObj);
      }

      setFormData({
        name: initialData.name || "",
        brand: initialData.brand || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        description: initialData.description || "",
        createdBy: "",
        updatedBy: session?.user?.id || "",
      });

      // If there's an initial brand, find and set it
      if (initialData.brand) {
        const fetchInitialBrand = async () => {
          try {
            const response = await api.brand.getBrands(initialData.brand);
            if (response) {
              setSelectedBrand(response);
            }
          } catch (error) {
            console.error("Error fetching initial brand:", error);
          }
        };

        fetchInitialBrand();
      }
    }
  }, [initialData, session?.user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle start date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        startDate: date.toLocaleDateString("en-CA"),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        startDate: "",
      }));
    }
    setStartDatePopoverOpen(false); // Close popover
  };

  // Handle end date selection
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        endDate: date.toLocaleDateString("en-CA"),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        endDate: "",
      }));
    }
    setEndDatePopoverOpen(false); // Close popover
  };

  // Handle brand selection
  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
    setFormData((prev) => ({
      ...prev,
      brand: brand.id,
    }));
    setBrandPopoverOpen(false); // Close popover
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
      isValid = false;
    }

    if (!formData.brand) {
      newErrors.brand = "Brand selection is required";
      isValid = false;
    }

    // Optional: Add date validation
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "End date cannot be before start date";
      isValid = false;
    }

    setErrors(newErrors);

    Object.keys(newErrors).forEach((key) => {
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }, 10000);
    });

    return isValid;
  };

  const normalizeUrl = (url: string): string => {
    if (url && !url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formData---------", formData);
    // return;

    // if (!validateForm()) {
    //   return;
    // }

    setLoading(true);

    try {
      if (initialData?.id) {
        await api.project.updateProjectById(initialData.id, formData);
      } else {
        await api.project.createProject(formData);
      }
      onClose();
      toast.success(
        `Project ${initialData ? "Updated" : "Created"} Successfully`,
        { position: "top-center" }
      );
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Failed to ${initialData ? "Update" : "Create"} project`, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-full mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label className="mb-2" htmlFor="name">
              Project Name
            </Label>
            <Input
              id="name"
              name="name"
              onChange={handleChange}
              value={formData.name}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Project Name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Brand Selection with Lazy Loading */}
          <div>
            <Label className="mb-2" htmlFor="brand">
              Select Brand
            </Label>
            <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={triggerRef}
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.brand ? "border-red-500" : ""
                  }`}
                >
                  {selectedBrand ? selectedBrand.name : "Select a brand"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
                onWheelCapture={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <Input
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="mb-2"
                  />
                </div>
                <div
                  ref={brandsListRef}
                  onScroll={handleBrandsScroll}
                  className="max-h-60 overflow-y-auto p-2"
                >
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                        onClick={() => handleBrandSelect(brand)}
                      >
                        {brand.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-2 text-gray-500">
                      {isLoadingBrands ? "Loading..." : "No brands found"}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {errors.brand && (
              <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="w-1/2 flex flex-col gap-2">
              <Label>Start Date</Label>
              <DatePicker
                selectedDate={startDate}
                onSelect={handleStartDateSelect}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              <Label>End Date</Label>
              <DatePicker
                selectedDate={endDate}
                onSelect={handleEndDateSelect}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              onChange={handleChange}
              value={formData.description}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading
              ? "Saving..."
              : initialData
              ? "Update Project"
              : "Register Project"}
          </Button>
        </form>
      </CardContent>
    </div>
  );
};

export default CreateProjectForm;
