export const OUTREACH_STATUSES = [
  { value: "follow", label: "Udah Saya Chat" },
  { value: "contacted", label: "Customer Balas" },
  { value: "survey", label: "Sudah Survei" },
  { value: "topup", label: "Berhasil Pinjam" },
];

export const OUTREACH_STATUS_LABELS = Object.fromEntries(
  OUTREACH_STATUSES.map((status) => [status.value, status.label])
);

export const getOutreachStatusLabel = (status) =>
  OUTREACH_STATUS_LABELS[status] || status || "-";
