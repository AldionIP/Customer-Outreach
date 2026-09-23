const express = require("express");

const {
  createFollowUp,
  getFollowUpsByCustomerId,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
} = require("../controllers/followUpController");

const router = express.Router();

router.post("/", createFollowUp);
router.get("/customer/:customerId", getFollowUpsByCustomerId);
router.get("/:id", getFollowUpById);
router.put("/:id", updateFollowUp);
router.delete("/:id", deleteFollowUp);

module.exports = router;