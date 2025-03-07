import { queryString } from "@/helper";
import { handleResponse } from "@/helper/handle-response";
import { authHeaders } from "@/helper/request-headers";
import { apiUrl } from "@/lib/apiConfig";

export const api = {
  auth: {
    adminLogin: async function (body: IAdminLoginBody) {
      const reqOptions = {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(`${apiUrl}/admin/login`, reqOptions).then(handleResponse);
    },
  },
  brand: {
    createBrand: async function (body: ICreateBrandBody) {
      const reqOptions = {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(`${apiUrl}/brand`, reqOptions).then(handleResponse);
    },
    getBrands: async function (query: any) {
      const reqOptions = {
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/brand?${queryString(query)}`, reqOptions).then(
        handleResponse
      );
    },
    downloadBrandsExcel: async function () {
      const reqOptions = {
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/brand/getAllBrandsDownload`, reqOptions).then(
        handleResponse
      );
    },
    downloadSelectedBrandsExcel: async function (body: IDownloadSelectedExcel) {
      const reqOptions = {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(
        `${apiUrl}/brand/getSelectedBrandsDownload`,
        reqOptions
      ).then(handleResponse);
    },
    deleteBrand: async function (query: any) {
      const reqOptions = {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/brand/${query}`, reqOptions).then(handleResponse);
    },
    updateBrandById: async function (id: string, body: IUpdateBrandBody) {
      const reqOptions = {
        method: "PUT",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(`${apiUrl}/brand/${id}`, reqOptions).then(handleResponse);
    },
  },
  project: {
    createProject: async function (body: ICreateProjectBody) {
      const reqOptions = {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(`${apiUrl}/project`, reqOptions).then(handleResponse);
    },
    getProjects: async function (query: any) {
      const reqOptions = {
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/project?${queryString(query)}`, reqOptions).then(
        handleResponse
      );
    },
    downloadProjectsExcel: async function () {
      const reqOptions = {
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/project/getAllBrandsDownload`, reqOptions).then(
        handleResponse
      );
    },
    deleteProject: async function (query: any) {
      const reqOptions = {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include" as RequestCredentials,
        cache: "no-store" as RequestCache,
      };
      return fetch(`${apiUrl}/project/${query}`, reqOptions).then(
        handleResponse
      );
    },
    updateProjectById: async function (id: string, body: IUpdateBrandBody) {
      const reqOptions = {
        method: "PUT",
        body: JSON.stringify(body),
        credentials: "include" as RequestCredentials,
        headers: authHeaders(),
      };
      return fetch(`${apiUrl}/project/${id}`, reqOptions).then(handleResponse);
    },
  },
};
