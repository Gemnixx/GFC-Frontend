import { api } from "./client";

export const createOrganization = async (data) => {
  const response = await api.post("/organizations", data);
  return response.data;
};

export const getOrganizations = async (params = {}) => {
  const response = await api.get("/organizations", {
    params,
  });
  return response.data;
};

export const getOrganization = async (id) => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

export const updateOrganization = async (id, data) => {
  const response = await api.put(`/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id) => {
  const response = await api.delete(`/organizations/${id}`);
  return response.data;
};