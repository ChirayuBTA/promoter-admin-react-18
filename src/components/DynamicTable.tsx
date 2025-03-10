"use client";

import { useEffect, useState } from "react";
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
  Calendar,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Settings2,
  X,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";
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

// Define generic Column interface
export interface Column<T> {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

// Define the props for the DynamicTable component
interface DynamicTableProps<T> {
  title: string;
  fetchData: (params: any) => Promise<{ data: T[]; total: number }>;
  columns: Column<T>[];
  initialColumns?: Column<T>[];
  keyField: keyof T;
  downloadExcel?: (selectedIds?: string[]) => Promise<void>;
  renderActions?: (item: T, onRefresh: () => void) => React.ReactNode;
  addButton?: {
    label: string;
    onClick: () => void;
  };
  showDateFilter?: boolean;
  dateFormat?: string;
  defaultPageSize?: number;
  allowSelection?: boolean;
}

const DynamicTable = <T extends Record<string, any>>({
  title,
  fetchData,
  columns: initialColumnsProp,
  initialColumns,
  keyField,
  downloadExcel,
  renderActions,
  addButton,
  showDateFilter = false,
  dateFormat = "dd MMM yyyy",
  defaultPageSize = 10,
  allowSelection = true,
}: DynamicTableProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultPageSize);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");
  const [columns, setColumns] = useState<Column<T>[]>(
    initialColumns || initialColumnsProp
  );
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
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [page, limit, search, sortBy, order, dateRange]);

  const loadData = async () => {
    const params: any = {
      limit,
      page,
    };

    if (search.length > 0) params.search = search;
    if (sortBy) {
      params.sortBy = sortBy;
      params.order = order;
    }
    if (dateRange.startDate || dateRange.endDate) {
      params.from = dateRange.startDate;
      params.to = dateRange.endDate;
    }

    setLoading(true);
    try {
      const res = await fetchData(params);
      setData(res.data);
      setTotal(res.total);
    } catch (error) {
      toast.error(`Failed to load ${title.toLowerCase()}`, {
        position: "top-center",
      });
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

  const handleSelectAll = () => {
    if (checkedItems.length === data.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(data.map((item) => String(item[keyField])));
    }
  };

  const handleSelect = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
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
    if (initialColumns) {
      setColumns([...initialColumns]);
    } else {
      setColumns(columns.map((col) => ({ ...col, visible: true })));
    }
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

  const formatDateValue = (date: Date | undefined) => {
    return date ? format(date, dateFormat) : "";
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
    setCheckedItems([]);
  };

  const handleExport = async () => {
    if (downloadExcel) {
      try {
        await downloadExcel();
        // toast.success("Excel download initiated", {
        //   position: "top-center",
        // });
      } catch (error) {
        // toast.error("Failed to download Excel", {
        //   position: "top-center",
        // });
        console.log("error:", error);
      }
    } else {
      defaultDownloadExcel();
    }
  };

  const handleExportSelected = async () => {
    if (downloadExcel && checkedItems.length > 0) {
      try {
        await downloadExcel(checkedItems);
        // toast.success("Excel download initiated", {
        //   position: "top-center",
        // });
      } catch (error) {
        // toast.error("Failed to download Excel", {
        //   position: "top-center",
        // });
        console.log("error:", error);
      }
    }
  };

  const defaultDownloadExcel = async () => {
    try {
      // Only include visible columns in the export
      const visibleColumns = columns.filter((col) => col.visible);

      const formattedData = data.map((item, index) => {
        const row: Record<string, any> = { "Sr. No.": index + 1 };

        visibleColumns.forEach((col) => {
          if (col.key !== "action") {
            const value = item[col.key];
            if (value instanceof Date) {
              row[col.label] = format(value, dateFormat);
            } else if (typeof value === "object" && value !== null) {
              row[col.label] = JSON.stringify(value);
            } else {
              row[col.label] = value ?? "-";
            }
          }
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);

      XLSX.writeFile(workbook, `${title}.xlsx`);
    } catch (error) {
      toast.error("Failed to download Excel", {
        position: "top-center",
      });
    }
  };

  const resetTable = async () => {
    resetColumns();
    setCheckedItems([]);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    });
    setSortBy("");
    setOrder("");
    setSearch("");
    setPage(1);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {/* Reset Table */}
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={resetTable}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Table
              </Button>

              {/* Date Picker */}
              {showDateFilter && (
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
                          ? `${formatDateValue(
                              dateRange.startDate
                            )} - ${formatDateValue(dateRange.endDate)}`
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
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={handleSearchChange}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              {/* Export */}
              {downloadExcel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Export</span>
                </Button>
              )}

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
                    <ChevronsUpDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map(
                    (column) =>
                      column.key !== keyField &&
                      column.key !== "name" &&
                      column.key !== "action" && (
                        <DropdownMenuCheckboxItem
                          key={column.key}
                          checked={column.visible}
                          onSelect={(e) => e.preventDefault()}
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
                      setOpen(false);
                    }}
                    className="justify-center"
                  >
                    Reset Columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Button */}
              {addButton && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={addButton.onClick}
                >
                  {addButton.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {allowSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        checkedItems.length === data.length && data.length > 0
                      }
                      onCheckedChange={() => handleSelectAll()}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead className="w-14 font-medium">No.</TableHead>
                {columns
                  .filter((col) => col.visible)
                  .map(({ key, label, sortable }) => (
                    <TableHead key={key} className="font-medium">
                      {sortable && key !== "action" ? (
                        <DropdownMenu>
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
                      colSpan={
                        columns.filter((col) => col.visible).length +
                        (allowSelection ? 2 : 1)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        {allowSelection && (
                          <Skeleton className="h-4 w-4 rounded" />
                        )}
                        <Skeleton className="h-4 w-8 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow
                    key={String(item[keyField])}
                    className="hover:bg-muted/50"
                  >
                    {allowSelection && (
                      <TableCell>
                        <Checkbox
                          checked={checkedItems.includes(
                            String(item[keyField])
                          )}
                          onCheckedChange={() =>
                            handleSelect(String(item[keyField]))
                          }
                          aria-label={`Select item ${index + 1}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    {columns
                      .filter((col) => col.visible)
                      .map((column) => {
                        if (column.key === "action" && renderActions) {
                          return (
                            <TableCell key={column.key}>
                              {renderActions(item, loadData)}
                            </TableCell>
                          );
                        } else if (column.render) {
                          return (
                            <TableCell key={column.key}>
                              {column.render(item, index)}
                            </TableCell>
                          );
                        } else {
                          const value = item[column.key];
                          return (
                            <TableCell key={column.key}>
                              {value instanceof Date ? (
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {format(value, dateFormat)}
                                </Badge>
                              ) : value !== undefined && value !== null ? (
                                String(value)
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        }
                      })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.filter((col) => col.visible).length +
                      (allowSelection ? 2 : 1)
                    }
                    className="h-24 text-center"
                  >
                    No {title.toLowerCase()} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {allowSelection && checkedItems.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 z-50">
            <div className="text-sm flex justify-center items-center gap-2 border px-3 rounded-lg">
              <p className="border-r p-2">{checkedItems.length} selected</p>
              <X
                size={15}
                className="mt-[2px] cursor-pointer"
                onClick={resetSelect}
              />
            </div>
            {/* Export Selected */}
            {downloadExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                className="flex bg-muted/50 items-center gap-2 text-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

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
            Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
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
                of {getTotalPages() || 1}
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

export default DynamicTable;
