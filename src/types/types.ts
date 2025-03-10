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
  brandId: string;
  startDate?: string | null;
  endDate?: string | null;
  createdBy: string;
  updatedBy?: string;
}

interface IDownloadSelectedExcel {
  ids: string[];
}

// Forms Types
interface IBrand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
}

interface IProject {
  id: string;
  name: string;
  brand: IBrand; // ✅ Change from 'string' to 'Brand'
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
}
