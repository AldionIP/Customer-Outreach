import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports`;

export const getCustomerOutreachReport = async ({
  dateFrom,
  dateTo,
  statuses = [],
}) => {
  const response = await axios.get(`${API_URL}/customers`, {
    params: {
      dateFrom,
      dateTo,
      statuses: statuses.join(","),
    },
  });

  return response.data;
};
