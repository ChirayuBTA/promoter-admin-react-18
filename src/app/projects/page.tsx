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
import DynamicTable, { Column } from "@/components/DynamicTable"; // Adjust the import path
import CreateProjectForm from "@/components/forms/CreateProjectForm";

const page = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  // Define columns for the brand table
  const columns: Column<IProject>[] = [
    { key: "name", label: "Name", visible: true, sortable: true },
    {
      key: "brand",
      label: "Brand",
      visible: true,
      sortable: true,
      render: (project) => project.brand?.name || "-",
    },
    {
      key: "startDate",
      label: "Start Date",
      visible: true,
      sortable: true,
      render: (project) => (
        <Badge variant="outline" className="font-normal">
          {format(new Date(project.startDate), "dd MMM yyyy")}
        </Badge>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      visible: true,
      sortable: true,
      render: (project) => (
        <Badge variant="outline" className="font-normal">
          {format(new Date(project.endDate), "dd MMM yyyy")}
        </Badge>
      ),
    },
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
      const res = await api.project.getProjects(params);
      return {
        data: res.data,
        total: res.total,
      };
    } catch (error) {
      toast.error("Failed to load projects", { position: "top-center" });
      return { data: [], total: 0 };
    }
  };

  console.log();

  // Download excel function
  const downloadProjectsExcel = async (selectedIds?: string[]) => {
    if (selectedIds && selectedIds.length > 0) {
      const body = { ids: selectedIds };
      return api.project.getProjects({});
    } else {
      return api.brand.getBrands({});
    }
  };

  // Handler for editing brand
  const handleEditProject = (project: IProject) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (project: IProject, onRefresh: () => void) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary cursor-pointer"
        onClick={() => handleEditProject(project)}
      >
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
    </div>
  );

  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="container mx-auto py-8">
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-fit h-fit overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedProject ? "Edit Brand" : "Brand Registration"}
            </DialogTitle>
          </DialogHeader>
          <CreateProjectForm
            initialData={selectedBrand}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog> */}

      <DynamicTable<IProject>
        title="Projects"
        fetchData={fetchBrands}
        columns={columns}
        keyField="id"
        downloadExcel={downloadProjectsExcel}
        renderActions={renderActions}
        addButton={{
          label: "Add Project",
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
