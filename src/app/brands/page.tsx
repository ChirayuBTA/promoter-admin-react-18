"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { Edit, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";
import BrandRegistrationForm from "@/components/forms/BrandRegistrationForm";
import DynamicTable, { Column } from "@/components/DynamicTable"; // Adjust the import path

const page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);

  // Define columns for the brand table
  const columns: Column<IBrand>[] = [
    { key: "name", label: "Name", visible: true, sortable: true },
    {
      key: "website",
      label: "Website",
      visible: true,
      sortable: true,
      render: (brand) =>
        brand.website ? (
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
        ),
    },
    // { key: "logoUrl", label: "Logo", visible: true, sortable: true },
    { key: "contactEmail", label: "Email", visible: true, sortable: true },
    { key: "contactPhone", label: "Phone", visible: true, sortable: true },
    {
      key: "createdAt",
      label: "Created At",
      visible: true,
      sortable: true,
      render: (brand) => (
        <Badge variant="outline" className="font-normal">
          {format(new Date(brand.createdAt), "dd MMM yyyy")}
        </Badge>
      ),
    },
    { key: "action", label: "Action", visible: true, sortable: false },
  ];

  // Fetch data function for the table
  const fetchBrands = async (params: any) => {
    try {
      const res = await api.brand.getBrands(params);
      return {
        data: res.data,
        total: res.total,
      };
    } catch (error) {
      toast.error("Failed to load brands", { position: "top-center" });
      return { data: [], total: 0 };
    }
  };

  // Download excel function
  const downloadBrandsExcel = async (selectedIds?: string[]) => {
    if (selectedIds && selectedIds.length > 0) {
      try {
        const body: IDownloadSelectedExcel = {
          ids: selectedIds,
        };
        const response = await api.brand.downloadSelectedBrandsExcel(body); // Fetch all data without filters
        const jsonData = response.data;

        // Only include visible columns in the export
        const visibleColumns = columns.filter((col) => col.visible);

        const formattedData = jsonData.map((brand: IBrand, index: number) => {
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
        // closeDownloadDialog();
      } catch (error) {
        toast.error("Failed to download Excel", {
          position: "top-center",
        });
      }
    } else {
      try {
        const response = await api.brand.getBrands({}); // Fetch all data without filters
        const jsonData = response.data;

        // Only include visible columns in the export
        const visibleColumns = columns.filter((col) => col.visible);

        const formattedData = jsonData.map((brand: IBrand, index: number) => {
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
        // closeDownloadDialog();
      } catch (error) {
        toast.error("Failed to download Excel", {
          position: "top-center",
        });
      }
    }
  };

  // Handler for editing brand
  const handleEditBrand = (brand: IBrand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (brand: IBrand, onRefresh: () => void) => (
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
  );

  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBrand(null);
  };

  return (
    <div className="container mx-auto py-8">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

      <DynamicTable<IBrand>
        title="Brands"
        fetchData={fetchBrands}
        columns={columns}
        keyField="id"
        downloadExcel={downloadBrandsExcel}
        renderActions={renderActions}
        addButton={{
          label: "Add Brand",
          onClick: () => setIsDialogOpen(true),
        }}
        showDateFilter={true}
        dateFormat="dd MMM yyyy"
        defaultPageSize={10}
        allowSelection={true}
      />
    </div>
  );
};

export default page;
