import axios from "axios";

const API_URL = "http://localhost:5000/api/customers";

export const getCustomers = async ({
  search = "",
  status = "",
} = {}) => {
  const response = await axios.get(API_URL, {
    params: {
      search,
      status,
    },
  });

  return response.data.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);

  return response.data.data;
};

export const createCustomer = async (customerData) => {
  const response = await axios.post(API_URL, customerData);

  return response.data.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    customerData
  );

  return response.data.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);

  return response.data.data;
};