"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Edit,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Settings,
  ExternalLink,
  Settings2,
  EyeClosed,
  EyeOff,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import BrandRegistrationForm from "@/components/forms/BrandRegistrationForm";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Define Brand interface
interface Brand {
  id: string;
  name: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  description?: string;
  logoUrl?: string;
}

// Define Column interface
interface Column {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

const BrandTable = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [checkedBrands, setCheckedBrands] = useState<string[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    { key: "name", label: "Name", visible: true, sortable: true },
    { key: "website", label: "Website", visible: true, sortable: true },
    { key: "contactEmail", label: "Email", visible: true, sortable: true },
    { key: "contactPhone", label: "Phone", visible: true, sortable: true },
    { key: "createdAt", label: "Created At", visible: true, sortable: true },
    { key: "action", label: "Action", visible: true, sortable: true },
  ]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    key: string;
  }>({
    startDate: undefined,
    endDate: undefined,
    key: "selection",
  });
  const [open, setOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [page, limit, search, sortBy, order, isDialogOpen, dateRange]);

  const fetchBrands = async () => {
    const body: any = {
      limit,
      page,
    };
    if (search.length > 0) body.search = search;
    if (sortBy) {
      body.sortBy = sortBy;
      body.order = order;
    }
    if (dateRange.startDate || dateRange.endDate) {
      body.from = dateRange.startDate;
      body.to = dateRange.endDate;
    }

    setLoading(true);
    try {
      const res = await api.brand.getBrands(body);
      setBrands(res.data);
      setTotal(res.total);
    } catch (error) {
      toast.error("Failed to load brands", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSort = (column: string, newOrder: "asc" | "desc") => {
    if (sortBy === column && order === newOrder) {
      // If already sorted in the selected order, reset sorting
      setSortBy("");
      setOrder("");
    } else {
      // Apply the new sorting order
      setSortBy(column);
      setOrder(newOrder);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return order === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const openDeleteConfirmation = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await api.brand.deleteBrand(brandToDelete.id);
      await fetchBrands();
      toast.success("Brand deleted successfully", {
        position: "top-center",
      });
      closeDeleteDialog();
    } catch (error) {
      toast.error("Failed to delete brand", {
        position: "top-center",
      });
    }
  };

  const openDownloadConfirmation = () => {
    setIsDownloadDialogOpen(true);
  };

  const closeDownloadDialog = () => {
    setIsDownloadDialogOpen(false);
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.brand.getBrands({}); // Fetch all data without filters
      const jsonData = response.data;

      // Only include visible columns in the export
      const visibleColumns = columns.filter((col) => col.visible);

      const formattedData = jsonData.map((brand: Brand, index: number) => {
        const row: Record<string, any> = { "Sr. No.": index + 1 };

        visibleColumns.forEach((col) => {
          if (col.key === "name") row["Name"] = brand.name;
          if (col.key === "website") row["Website"] = brand.website || "-";
          if (col.key === "contactEmail")
            row["Email"] = brand.contactEmail || "-";
          if (col.key === "contactPhone")
            row["Phone"] = brand.contactPhone || "-";
          if (col.key === "createdAt")
            row["Created At"] = format(
              new Date(brand.createdAt),
              "dd MMM yyyy"
            );
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

      XLSX.writeFile(workbook, "Brands.xlsx");
      toast.success("Excel download initiated", {
        position: "top-center",
      });
      closeDownloadDialog();
    } catch (error) {
      toast.error("Failed to download Excel", {
        position: "top-center",
      });
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen((prev) => !prev);
    setSelectedBrand(null);
  };

  const handleSelectAll = () => {
    if (checkedBrands.length === brands.length) {
      setCheckedBrands([]);
    } else {
      setCheckedBrands(brands.map((brand) => brand.id));
    }
  };

  const handleSelect = (id: string) => {
    setCheckedBrands((prev) =>
      prev.includes(id)
        ? prev.filter((brandId) => brandId !== id)
        : [...prev, id]
    );
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(
      columns.map((col) =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const resetColumns = () => {
    setColumns(columns.map((col) => ({ ...col, visible: true })));
  };

  const handleDateChange = (ranges: any) => {
    if (ranges.selection?.startDate && ranges.selection?.endDate) {
      setDateRange({
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.endDate,
        key: "selection",
      });
    }
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, "MMM dd, yyyy") : "";
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    });
  };

  const getTotalPages = () => Math.ceil(total / limit);

  const resetSelect = () => {
    setCheckedBrands([]);
  };

  const downloadSelectedBrandExcel = async () => {
    try {
      const body: IDownloadSelectedExcel = {
        ids: checkedBrands,
      };
      const response = await api.brand.downloadSelectedBrandsExcel(body); // Fetch all data without filters
      const jsonData = response.data;

      // Only include visible columns in the export
      const visibleColumns = columns.filter((col) => col.visible);

      const formattedData = jsonData.map((brand: Brand, index: number) => {
        const row: Record<string, any> = { "Sr. No.": index + 1 };

        visibleColumns.forEach((col) => {
          if (col.key === "name") row["Name"] = brand.name;
          if (col.key === "website") row["Website"] = brand.website || "-";
          if (col.key === "description")
            row["Description"] = brand.description || "-";
          if (col.key === "logoUrl") row["logoUrl"] = brand.logoUrl || "-";
          if (col.key === "contactEmail")
            row["Email"] = brand.contactEmail || "-";
          if (col.key === "contactPhone")
            row["Phone"] = brand.contactPhone || "-";
          if (col.key === "createdAt")
            row["Created At"] = format(
              new Date(brand.createdAt),
              "dd MMM yyyy"
            );
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

      XLSX.writeFile(workbook, "Selected Brands.xlsx");
      toast.success("Excel download initiated", {
        position: "top-center",
      });
      closeDownloadDialog();
    } catch (error) {
      toast.error("Failed to download Excel", {
        position: "top-center",
      });
    }
  };

  const resetTable = async () => {
    setColumns([
      { key: "name", label: "Name", visible: true, sortable: true },
      { key: "website", label: "Website", visible: true, sortable: true },
      { key: "contactEmail", label: "Email", visible: true, sortable: true },
      { key: "contactPhone", label: "Phone", visible: true, sortable: true },
      { key: "createdAt", label: "Created At", visible: true, sortable: true },
      { key: "action", label: "Action", visible: true, sortable: true },
    ]);
    setCheckedBrands([]);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    });
    setSortBy("");
    setOrder("");
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Brands</CardTitle>
            <div className="flex items-center gap-2">
              {/* Reset Table */}
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={resetTable}
              >
                <RotateCcw /> Reset Table
              </Button>
              {/* Date Picker */}
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs px-2 py-1 whitespace-nowrap cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {dateRange.startDate && dateRange.endDate
                        ? `${formatDate(dateRange.startDate)} - ${formatDate(
                            dateRange.endDate
                          )}`
                        : "Pick A Date"}
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-2 rounded-lg shadow-md border"
                  align="end"
                >
                  <DateRange
                    ranges={[dateRange]}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                  />
                  <div className="flex justify-between items-center border-t p-2">
                    <Button
                      variant="ghost"
                      onClick={resetDateRange}
                      className="cursor-pointer"
                    >
                      Reset
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="cursor-pointer"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={openDownloadConfirmation}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              {/* View */}
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden md:inline">View</span>
                    <ChevronsUpDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  onCloseAutoFocus={(e) => e.preventDefault()} // Prevents auto-closing on selection
                >
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map(
                    (column) =>
                      column.label !== "Name" &&
                      column.label !== "Action" && (
                        <DropdownMenuCheckboxItem
                          key={column.key}
                          checked={column.visible}
                          onSelect={(e) => e.preventDefault()} // Prevents closing
                          onCheckedChange={() => {
                            toggleColumnVisibility(column.key);
                          }}
                          className="capitalize"
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      )
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      resetColumns();
                      setOpen(false); // Close only when resetting
                    }}
                    className="justify-center"
                  >
                    Reset Columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Add Brand */}
              <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Add Brand</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-fit h-fit overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {selectedBrand ? "Edit Brand" : "Brand Registration"}
                    </DialogTitle>
                  </DialogHeader>
                  <BrandRegistrationForm
                    initialData={selectedBrand}
                    onClose={handleCloseDialog}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      checkedBrands.length === brands.length &&
                      brands.length > 0
                    }
                    onCheckedChange={() => handleSelectAll()}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-14 font-medium">No.</TableHead>
                {columns
                  .filter((col) => col.visible)
                  .map(({ key, label, sortable }) => (
                    <TableHead key={key} className="font-medium">
                      {sortable ? (
                        <DropdownMenu>
                          {key !== "action" && (
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex h-8 items-center gap-1 px-2 py-1 font-medium cursor-pointer"
                              >
                                {label}
                                {getSortIcon(key)}
                              </Button>
                            </DropdownMenuTrigger>
                          )}

                          <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleSort(key, "asc")}
                              className="flex items-center gap-2"
                            >
                              <ChevronUp className="h-4 w-4" />
                              <span>Sort Ascending</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSort(key, "desc")}
                              className="flex items-center gap-2"
                            >
                              <ChevronDown className="h-4 w-4" />
                              <span>Sort Descending</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleColumnVisibility(key)}
                              className="flex items-center gap-2"
                            >
                              <EyeOff className="h-4 w-4" />
                              <span>Hide Column</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="font-medium">{label}</span>
                      )}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell
                      colSpan={columns.filter((col) => col.visible).length + 2}
                    >
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-8 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : brands.length > 0 ? (
                brands.map((brand, index) => (
                  <TableRow key={brand.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={checkedBrands.includes(brand.id)}
                        onCheckedChange={() => handleSelect(brand.id)}
                        aria-label={`Select ${brand.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    {columns.find((col) => col.key === "name")?.visible && (
                      <TableCell className="font-medium">
                        {brand.name}
                      </TableCell>
                    )}
                    {columns.find((col) => col.key === "website")?.visible && (
                      <TableCell>
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {brand.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {columns.find((col) => col.key === "contactEmail")
                      ?.visible && (
                      <TableCell>
                        {brand.contactEmail ? (
                          brand.contactEmail
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {columns.find((col) => col.key === "contactPhone")
                      ?.visible && (
                      <TableCell>
                        {brand.contactPhone ? (
                          brand.contactPhone
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    {columns.find((col) => col.key === "createdAt")
                      ?.visible && (
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {format(new Date(brand.createdAt), "dd MMM yyyy")}
                        </Badge>
                      </TableCell>
                    )}
                    {columns.find((col) => col.key === "action")?.visible && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary cursor-pointer"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((col) => col.visible).length + 2}
                    className="h-24 text-center"
                  >
                    No brands found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {checkedBrands.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 z-50">
            <div className="text-sm flex justify-center items-center gap-2 border px-3 rounded-lg">
              <p className="border-r p-2">{checkedBrands.length} selected</p>
              <X
                size={15}
                className="mt-[2px] cursor-pointer"
                onClick={resetSelect}
              />
            </div>
            {/* Export Selected */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSelectedBrandExcel}
              className="flex bg-muted/50 items-center gap-2 text-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {/* <span className="hidden md:inline">Export Selected</span> */}
            </Button>
            {/* Delete Selected */}
            <Button
              variant="outline"
              size="sm"
              className="flex bg-muted/50 items-center gap-2 text-sm cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {/* <span className="hidden md:inline">Delete Selected</span> */}
            </Button>
          </div>
        )}

        {/* Download Excel Confirmation Dialog */}
        <Dialog
          open={isDownloadDialogOpen}
          onOpenChange={setIsDownloadDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Download all brand data as an Excel spreadsheet?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={closeDownloadDialog}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownloadExcel}
                className="gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the brand "{brandToDelete?.name}
                "? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="cursor-pointer"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Rows per page:</p>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            Showing {brands.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} entries
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            <span className="flex items-center gap-1 mx-2">
              <span className="text-sm font-medium">{page}</span>
              <span className="text-sm text-muted-foreground">
                of {getTotalPages()}
              </span>
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= getTotalPages()}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(getTotalPages())}
              disabled={page >= getTotalPages()}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandTable;
