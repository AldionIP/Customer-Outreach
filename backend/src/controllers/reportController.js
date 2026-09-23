const reportService = require("../services/reportService");

const VALID_OUTREACH_STATUSES = new Set([
  "follow",
  "contacted",
  "survey",
  "topup",
]);

const isIsoDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const getCustomerOutreachReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, statuses = "" } = req.query;
    const selectedStatuses = String(statuses)
      .split(",")
      .map((status) => status.trim())
      .filter(Boolean);

    if (!isIsoDate(dateFrom) || !isIsoDate(dateTo)) {
      return res.status(400).json({
        message: "dateFrom and dateTo must use YYYY-MM-DD format.",
      });
    }

    if (dateFrom > dateTo) {
      return res.status(400).json({
        message: "dateFrom cannot be later than dateTo.",
      });
    }

    if (selectedStatuses.some((status) => !VALID_OUTREACH_STATUSES.has(status))) {
      return res.status(400).json({
        message: "Invalid outreach status filter.",
      });
    }

    const data = await reportService.getCustomerOutreachReport({
      dateFrom,
      dateTo,
      statuses: [...new Set(selectedStatuses)],
    });

    res.status(200).json({
      data,
      count: data.length,
      period: { dateFrom, dateTo },
      statuses: [...new Set(selectedStatuses)],
    });
  } catch (error) {
    console.error("Customer outreach report error:", error);

    res.status(500).json({
      message: "Failed to load customer outreach report.",
    });
  }
};

module.exports = {
  getCustomerOutreachReport,
};
