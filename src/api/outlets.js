import { api } from "./client";

export const createOutlet = async (data) => {
  const response = await api.post("/outlets", data);
  return response.data;
};

export const getOutlets = async (params = {}) => {
  const response = await api.get("/outlets", { params });
  return response.data;
};

export const getOutletsByOrganization = async (organizationId) => {
  const response = await api.get(
    `/outlets/organization/${organizationId}`
  );
  return response.data;
};

export const getOutlet = async (id) => {
  const response = await api.get(`/outlets/${id}`);
  return response.data;
};

export const updateOutlet = async (id, data) => {
  const response = await api.put(`/outlets/${id}`, data);
  return response.data;
};

export const deleteOutlet = async (id) => {
  const response = await api.delete(`/outlets/${id}`);
  return response.data;
};