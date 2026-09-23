const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/follow-ups`;

export const getFollowUpsByCustomerId = async (customerId) => {
  const response = await fetch(
    `${API_URL}/customer/${customerId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch follow-ups");
  }

  const result = await response.json();

  return result.data;
};

export const createFollowUp = async ({
  customerId,
  note,
  followUpDate,
}) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      note,
      followUpDate,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create follow-up");
  }

  const result = await response.json();

  return result.data;
};

export const updateFollowUp = async (
  id,
  { note, followUpDate }
) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      note,
      followUpDate,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update follow-up");
  }

  const result = await response.json();

  return result.data;
};

export const deleteFollowUp = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete follow-up");
  }

  const result = await response.json();

  return result.data;
};