interface IAdminLoginBody {
  email: string;
  password: string;
}
interface ICreateBrandBody {
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdBy?: string;
}
interface IUpdateBrandBody extends ICreateBrandBody {
  updatedBy?: string;
}

interface ICreateProjectBody {
  name: string;
  description?: string;
  brand: string;
  startDate?: string | null;
  endDate?: string | null;
  createdBy: string;
  updatedBy?: string;
}

interface IDownloadSelectedExcel {
  ids: string[];
}
