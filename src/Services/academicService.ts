import axiosInstance from "../lib/axiosInstance";

export type ResourceType = "years" | "classes" | "sections" | "subjects";

export const AcademicService = {
  getAll: async (resource: ResourceType) => {
    const response = await axiosInstance.get(`/academic/${resource}`);
    return response.data;
  },

  create: async (resource: ResourceType, data: unknown) => {
    const endpointMap: Record<ResourceType, string> = {
      years: "/academic/create-year",
      classes: "/academic/create-class",
      sections: "/academic/create-section",
      subjects: "/academic/create-subject",
    };

    const response = await axiosInstance.post(endpointMap[resource], data);
    return response.data;
  },

  update: async (resource: ResourceType, id: string, data: unknown) => {
    const response = await axiosInstance.put(`/academic/${resource}/${id}`, data);
    return response.data;
  },

  delete: async (resource: ResourceType, id: string) => {
    const response = await axiosInstance.delete(`/academic/${resource}/${id}`);
    return response.data;
  },
};