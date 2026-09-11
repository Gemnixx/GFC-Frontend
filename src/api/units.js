import { api } from "./client";

export const createUnit = async (data) => {
  const response = await api.post("/units", data);
  return response.data;
};

export const getUnits = async (params = {}) => {
  const response = await api.get("/units", { params });
  return response.data;
};

export const getUnitsByOrganization = async (organizationId) => {
  const response = await api.get(
    `/units/organization/${organizationId}`
  );
  return response.data;
};

export const getUnit = async (id) => {
  const response = await api.get(`/units/${id}`);
  return response.data;
};

export const updateUnit = async (id, data) => {
  const response = await api.put(`/units/${id}`, data);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await api.delete(`/units/${id}`);
  return response.data;
};