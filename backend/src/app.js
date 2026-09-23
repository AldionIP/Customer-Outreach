const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const customerRoutes = require("./routes/customerRoutes");
const followUpRoutes = require("./routes/followUpRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Root Endpoint
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    message: "Customer Outreach API is running",
  });
});

/*
|--------------------------------------------------------------------------
| Database Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

app.use("/api/customers", customerRoutes);

/*
|--------------------------------------------------------------------------
| Follow-up Routes
|--------------------------------------------------------------------------
*/

app.use("/api/follow-ups", followUpRoutes);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});