const followUpService = require("../services/followUpService");
const customerService = require("../services/customerService");

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const isValidUuid = (value) => {
  if (typeof value !== "string") return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
};

const isValidDate = (value) => {
  if (!value) return true;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const createFollowUp = async (req, res) => {
  try {
    const { customerId, note, followUpDate } = req.body;

    const trimmedCustomerId = normalizeText(customerId);
    const trimmedNote = normalizeText(note);

    if (!trimmedCustomerId || !isValidUuid(trimmedCustomerId)) {
      return res.status(400).json({
        message: "Valid customer ID is required",
      });
    }

    const customer =
      await customerService.getCustomerById(trimmedCustomerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (!trimmedNote) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    if (!isValidDate(followUpDate)) {
      return res.status(400).json({
        message: "Follow-up date is invalid",
      });
    }

    const followUp =
      await followUpService.createFollowUp({
        customerId: trimmedCustomerId,
        note: trimmedNote,
        followUpDate: followUpDate || null,
      });

    res.status(201).json({
      message: "Follow-up created successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Create follow-up error:", error);

    res.status(500).json({
      message: "Failed to create follow-up",
    });
  }
};

const getFollowUpsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!isValidUuid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer =
      await customerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const followUps =
      await followUpService.getFollowUpsByCustomerId(
        customerId
      );

    res.status(200).json({
      data: followUps,
    });
  } catch (error) {
    console.error(
      "Get customer follow-ups error:",
      error
    );

    res.status(500).json({
      message: "Failed to get follow-ups",
    });
  }
};

const getFollowUpById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid follow-up ID",
      });
    }

    const followUp =
      await followUpService.getFollowUpById(id);

    if (!followUp) {
      return res.status(404).json({
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      data: followUp,
    });
  } catch (error) {
    console.error(
      "Get follow-up error:",
      error
    );

    res.status(500).json({
      message: "Failed to get follow-up",
    });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, followUpDate } = req.body;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid follow-up ID",
      });
    }

    const trimmedNote = normalizeText(note);

    if (!trimmedNote) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    if (!isValidDate(followUpDate)) {
      return res.status(400).json({
        message: "Follow-up date is invalid",
      });
    }

    const followUp =
      await followUpService.updateFollowUp(id, {
        note: trimmedNote,
        followUpDate: followUpDate || null,
      });

    if (!followUp) {
      return res.status(404).json({
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      message: "Follow-up updated successfully",
      data: followUp,
    });
  } catch (error) {
    console.error(
      "Update follow-up error:",
      error
    );

    res.status(500).json({
      message: "Failed to update follow-up",
    });
  }
};

const deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({
        message: "Invalid follow-up ID",
      });
    }

    const deletedFollowUp =
      await followUpService.deleteFollowUp(id);

    if (!deletedFollowUp) {
      return res.status(404).json({
        message: "Follow-up not found",
      });
    }

    res.status(200).json({
      message: "Follow-up deleted successfully",
      data: deletedFollowUp,
    });
  } catch (error) {
    console.error(
      "Delete follow-up error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete follow-up",
    });
  }
};

module.exports = {
  createFollowUp,
  getFollowUpsByCustomerId,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
};