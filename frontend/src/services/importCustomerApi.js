import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customers`;

export const previewCustomerImport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/import-preview`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const importCustomers = async (rows) => {
  const response = await axios.post(`${API_URL}/import`, {
    rows,
  });

  return response.data;
};
