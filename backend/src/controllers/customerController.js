const customerService = require("../services/customerService");

const VALID_CUSTOMER_STATUSES = new Set([
  "follow",
  "contacted",
  "survey",
  "topup",
]);

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const isValidEmail = (email) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

const isValidUuid = (value) => {
  if (typeof value !== "string") return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
};

const getCustomers = async (req, res) => {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    if (status && !VALID_CUSTOMER_STATUSES.has(status)) {
      return res.status(400).json({
        message: "Status must be one of: follow, contacted, survey, topup",
      });
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1
    ) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100",
      });
    }

    const result =
      await customerService.getAllCustomers({
        search,
        status,
        page: parsedPage,
        limit: parsedLimit,
      });

    res.status(200).json(result);
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to get customers",
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer =
      await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      data: customer,
    });
  } catch (error) {
    console.error("Get customer by ID error:", error);

    res.status(500).json({
      message: "Failed to get customer",
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      status,
    } = req.body;

    const trimmedName = normalizeText(name);
    const trimmedPhone = normalizeText(phone);
    const trimmedEmail = normalizeText(email);
    const trimmedAddress = normalizeText(address);
    const trimmedStatus = normalizeText(status);

    if (!trimmedName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!trimmedPhone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Email format is invalid",
      });
    }

    if (
      trimmedStatus &&
      !VALID_CUSTOMER_STATUSES.has(trimmedStatus)
    ) {
      return res.status(400).json({
        message:
          "Status must be one of: follow, contacted, survey, topup",
      });
    }

    const customer =
      await customerService.createCustomer({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        address: trimmedAddress || null,
        status: trimmedStatus || "follow",
      });

    res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      status,
    } = req.body;

    const trimmedName = normalizeText(name);
    const trimmedPhone = normalizeText(phone);
    const trimmedEmail = normalizeText(email);
    const trimmedAddress = normalizeText(address);
    const trimmedStatus = normalizeText(status);

    if (!trimmedName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!trimmedPhone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Email format is invalid",
      });
    }

    if (
      trimmedStatus &&
      !VALID_CUSTOMER_STATUSES.has(trimmedStatus)
    ) {
      return res.status(400).json({
        message:
          "Status must be one of: follow, contacted, survey, topup",
      });
    }

    const existingCustomer =
      await customerService.getCustomerById(id);

    if (!existingCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const customer =
      await customerService.updateCustomer(id, {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        address: trimmedAddress || null,
        status: trimmedStatus || existingCustomer.status,
      });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const deletedCustomer =
      await customerService.deleteCustomer(id);

    if (!deletedCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
      data: deletedCustomer,
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};