const followUpService = require("../services/followUpService");

const createFollowUp = async (req, res) => {
  try {
    const { customerId, note, followUpDate } = req.body;

    if (!customerId || !note) {
      return res.status(400).json({
        message: "Customer ID and note are required",
      });
    }

    const followUp =
      await followUpService.createFollowUp({
        customerId,
        note,
        followUpDate,
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

    if (!note) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const followUp =
      await followUpService.updateFollowUp(id, {
        note,
        followUpDate,
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