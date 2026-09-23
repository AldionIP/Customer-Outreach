const express = require("express");

const {
  getCustomerOutreachReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/customers", getCustomerOutreachReport);

module.exports = router;
