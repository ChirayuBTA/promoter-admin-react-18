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
  Trash,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateProjectForm from "@/components/forms/CreateProjectForm";
import toast from "react-hot-toast";
import { DialogDescription } from "@radix-ui/react-dialog";

// Define project interface
interface project {
  id: string;
  name: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
}

const projectTable = () => {
  const [projects, setprojects] = useState<project[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedproject, setSelectedproject] = useState<project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setprojectToDelete] = useState<project | null>(null);
  const [isDownloadDilogOpen, setIsDownloadDilogOpen] = useState(false);

  useEffect(() => {
    const fetchprojects = async () => {
      const body: any = {
        limit,
        page,
      };
      if (search.length > 0) body.search = search;
      if (sortBy) {
        body.sortBy = sortBy;
        body.order = order;
      }

      setLoading(true);
      try {
        const res = await api.project.getProjects(body);
        setprojects(res.data);
        setTotal(res.total);
      } catch (error) {
        toast.error("Failed to load Data", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchprojects();
  }, [page, search, sortBy, order, isDialogOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (order === "asc") {
        setOrder("desc");
      } else if (order === "desc") {
        setSortBy("");
        setOrder("");
      } else {
        setOrder("asc");
      }
    } else {
      setSortBy(column);
      setOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return order === "asc" ? (
        <ChevronUp size={16} />
      ) : (
        <ChevronDown size={16} />
      );
    }
    return <ChevronsUpDown size={16} className="text-gray-400" />;
  };

  const openDeleteConfirmation = (project: any) => {
    setprojectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setprojectToDelete(null);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await api.project.deleteProject(projectToDelete.id);
      // Refresh the projects list
      const body: any = {
        limit,
        page,
      };
      const res = await api.project.getProjects(body);
      setprojects(res.data);
      setTotal(res.total);
      toast.success(`Successfully Deleted project`, {
        position: "top-center",
      });
      closeDeleteDialog();
    } catch (error) {
      toast.error(`Failed to Delete project`, {
        position: "top-center",
      });
    }
  };

  const openDownloadConfirmation = () => {
    setIsDownloadDilogOpen(true);
  };

  const closeDownloadDialog = () => {
    setIsDownloadDilogOpen(false);
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.project.getProjects({}); // Fetch all data without filters
      const jsonData = response.data;

      const formattedData = jsonData.map((project: any, index: number) => ({
        "Sr. No.": index + 1,
        Name: project.name,
        Brand: project.brand.name,
        StartDate: project.startDate,
        EndDate: project.endDate,
        Description: project.description,
        "Created At": format(new Date(project.createdAt), "dd MMM yyyy, HH:mm"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "projects");

      XLSX.writeFile(workbook, "projects.xlsx");
      toast.success(`Excel Download Initiated`, {
        position: "top-center",
      });
    } catch (error) {
      toast.error(`Failed to download Excel`, {
        position: "top-center",
      });
    }
  };

  const handleEditproject = (project: any) => {
    setSelectedproject(project);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen((prev) => !prev);
    setSelectedproject(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Projects
          <div className="flex gap-2">
            <Button
              onClick={openDownloadConfirmation}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Download size={16} /> Download Excel
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={16} /> Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[70vh] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedproject ? "Edit project" : "Project Registration"}
                  </DialogTitle>
                </DialogHeader>
                <CreateProjectForm
                  initialData={selectedproject}
                  onClose={handleCloseDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <Input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={handleSearchChange}
          className="mt-2"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr. No.</TableHead>
              {[
                { key: "name", label: "Name" },
                { key: "brand", label: "Brand" },
                { key: "startDate", label: "Start Date" },
                { key: "endDate", label: "End Date" },
                { key: "createdAt", label: "Created At" },
                { key: "action", label: "Action" },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  onClick={() => key !== "action" && handleSort(key)}
                  className={key !== "action" ? "cursor-pointer" : ""}
                >
                  <div className="flex items-center gap-1">
                    {label} {key !== "action" && getSortIcon(key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.length > 0 ? (
              projects.map((project: any, index: number) => (
                <TableRow key={project.id}>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    {project.brand.name ? project.brand.name : "-"}
                  </TableCell>
                  <TableCell>
                    {project.startDate
                      ? format(new Date(project.startDate), "dd MMM yyyy")
                      : "-"}{" "}
                  </TableCell>
                  <TableCell>
                    {project.endDate
                      ? format(new Date(project.endDate), "dd MMM yyyy")
                      : "-"}{" "}
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      className="text-blue-600 cursor-pointer"
                      onClick={() => handleEditproject(project)}
                    >
                      <Edit size={18} className="mr-1" />
                    </button>
                    {/* <button
                      className="text-red-600 cursor-pointer"
                      onClick={() => openDeleteConfirmation(project)}
                    >
                      <Trash size={18} className="mr-1" />
                    </button> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {loading ? "Loading..." : "No projects found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Download Excel Confirmation Dialog */}
        <Dialog open={isDownloadDilogOpen} onOpenChange={closeDownloadDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Download</DialogTitle>
              <DialogDescription>
                Are you sure you want to download all project Data in Excel?
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
                variant="default"
                onClick={handleDownloadExcel}
                className="cursor-pointer"
              >
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the project "
                {projectToDelete?.name}
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
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </p>
          <div className="flex gap-2">
            <Button
              className={`cursor-pointer`}
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              className={`cursor-pointer`}
              disabled={page * limit >= total}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default projectTable;
