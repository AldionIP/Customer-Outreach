const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
require("dotenv").config();

const pool = require("./config/database");
const customerRoutes = require("./routes/customerRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const reportRoutes = require("./routes/reportRoutes");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedExtensions = [
      "csv",
      "xls",
      "xlsx",
    ];
    const extension = file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error(
          "Only CSV, XLS, and XLSX files are allowed."
        )
      );
    }

    callback(null, true);
  },
});

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const isValidEmail = (email) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const buildCustomerRow = (row) => ({
  name: normalizeCell(
    row.name ??
      row.Name ??
      row.customer_name ??
      row.customerName
  ),
  phone: normalizeCell(
    row.phone ??
      row.Phone ??
      row.mobile ??
      row.contact_number
  ),
  email: normalizeCell(
    row.email ??
      row.Email ??
      row.e_mail ??
      row.mail
  ),
  address: normalizeCell(
    row.address ??
      row.Address ??
      row.street_address ??
      row.location
  ),
});

const getDashboardStats = async (req, res) => {
  try {
    const totalCustomersResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM customers"
    );

    const statusResults = await pool.query(
      `
        SELECT status, COUNT(*)::int AS total
        FROM customers
        GROUP BY status
      `
    );

    const totalFollowUpsResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM follow_ups"
    );

    const recentFollowUpsResult = await pool.query(
      `
        SELECT
          f.id,
          f.customer_id,
          f.note,
          f.follow_up_date,
          f.created_at,
          f.updated_at,
          c.name AS customer_name,
          c.status AS customer_status
        FROM follow_ups f
        LEFT JOIN customers c ON c.id = f.customer_id
        ORDER BY f.created_at DESC
        LIMIT 5
      `
    );

    const upcomingFollowUpsResult = await pool.query(
      `
        SELECT
          f.id,
          f.customer_id,
          f.note,
          f.follow_up_date,
          c.name AS customer_name,
          c.status AS customer_status
        FROM follow_ups f
        LEFT JOIN customers c ON c.id = f.customer_id
        WHERE f.follow_up_date IS NOT NULL
          AND f.follow_up_date >= CURRENT_DATE
        ORDER BY f.follow_up_date ASC, f.created_at DESC
        LIMIT 5
      `
    );

    const overdueFollowUpsResult = await pool.query(
      `
        SELECT
          f.id,
          f.customer_id,
          f.note,
          f.follow_up_date,
          c.name AS customer_name,
          c.status AS customer_status
        FROM follow_ups f
        LEFT JOIN customers c ON c.id = f.customer_id
        WHERE f.follow_up_date IS NOT NULL
          AND f.follow_up_date < CURRENT_DATE
        ORDER BY f.follow_up_date ASC, f.created_at DESC
        LIMIT 5
      `
    );

    const upcomingFollowUpsCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM follow_ups
        WHERE follow_up_date IS NOT NULL
          AND follow_up_date >= CURRENT_DATE
      `
    );

    const overdueFollowUpsCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM follow_ups
        WHERE follow_up_date IS NOT NULL
          AND follow_up_date < CURRENT_DATE
      `
    );

    const statusTotals = statusResults.rows.reduce(
      (accumulator, row) => {
        accumulator[row.status] = Number(row.total);
        return accumulator;
      },
      {
        follow: 0,
        contacted: 0,
        survey: 0,
        topup: 0,
      }
    );

    const dashboard = {
      totalCustomers: Number(totalCustomersResult.rows[0].total),
      followCustomers: Number(statusTotals.follow || 0),
      contactedCustomers: Number(statusTotals.contacted || 0),
      surveyCustomers: Number(statusTotals.survey || 0),
      topupCustomers: Number(statusTotals.topup || 0),
      totalFollowUps: Number(totalFollowUpsResult.rows[0].total),
      upcomingFollowUps: Number(upcomingFollowUpsCountResult.rows[0].total),
      overdueFollowUps: Number(overdueFollowUpsCountResult.rows[0].total),
      recentFollowUps: recentFollowUpsResult.rows,
      upcomingFollowUpItems: upcomingFollowUpsResult.rows,
      overdueFollowUpItems: overdueFollowUpsResult.rows,
    };

    res.status(200).json(dashboard);
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Failed to get dashboard statistics",
    });
  }
};

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

app.use("/api/reports", reportRoutes);

app.post(
  "/api/customers/import-preview",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a CSV or Excel file.",
        });
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        return res.status(400).json({
          message: "The selected file is empty.",
        });
      }

      const jsonRows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      if (!jsonRows.length) {
        return res.status(400).json({
          message: "No rows were found in the file.",
        });
      }

      const firstRow = jsonRows[0];
      const headers = Object.keys(firstRow || {});
      const normalizedHeaders = headers.map(normalizeHeader);

      const requiredHeadersPresent = [
        "name",
        "phone",
      ].every((column) =>
        normalizedHeaders.includes(column)
      );

      if (!requiredHeadersPresent) {
        return res.status(400).json({
          message:
            "Import file must include at least these columns: name, phone, email, address",
        });
      }

      const existingRows = await pool.query(
        `
          SELECT LOWER(TRIM(name)) AS name_key,
                 LOWER(TRIM(phone)) AS phone_key
          FROM customers
        `
      );

      const databaseKeys = new Set(
        existingRows.rows.map((row) => {
          const nameKey = normalizeCell(row.name_key);
          const phoneKey = normalizeCell(row.phone_key);

          return `${nameKey}::${phoneKey}`;
        })
      );

      const validRows = [];
      const invalidRows = [];

      jsonRows.forEach((row, index) => {
        const normalizedRow = buildCustomerRow(row);
        const rowNumber = index + 2;
        const errors = [];

        if (!normalizedRow.name) {
          errors.push("Name is required.");
        }

        if (!normalizedRow.phone) {
          errors.push("Phone is required.");
        }

        if (
          normalizedRow.email &&
          !isValidEmail(normalizedRow.email)
        ) {
          errors.push("Email format is invalid.");
        }

        const duplicateKey = `${normalizeCell(
          normalizedRow.name
        ).toLowerCase()}::${normalizeCell(
          normalizedRow.phone
        ).toLowerCase()}`;

        if (databaseKeys.has(duplicateKey)) {
          errors.push(
            "A customer with the same name and phone already exists."
          );
        }

        if (errors.length > 0) {
          invalidRows.push({
            rowNumber,
            data: normalizedRow,
            errors,
          });
          return;
        }

        validRows.push({
          rowNumber,
          name: normalizedRow.name,
          phone: normalizedRow.phone,
          email: normalizedRow.email || "",
          address: normalizedRow.address || "",
          status: "follow",
        });
      });

      res.status(200).json({
        validRows,
        invalidRows,
        totalRows: jsonRows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
      });
    } catch (error) {
      console.error("Import preview error:", error);

      res.status(500).json({
        message: "Failed to process the import file.",
      });
    }
  }
);

app.post("/api/customers/import", async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        message: "No valid customer rows were provided.",
      });
    }

    const validatedRows = rows.map((row) => {
      const normalizedRow = buildCustomerRow(row);

      if (!normalizedRow.name || !normalizedRow.phone) {
        throw new Error("Each row needs a name and phone.");
      }

      if (
        normalizedRow.email &&
        !isValidEmail(normalizedRow.email)
      ) {
        throw new Error(
          "One or more imported rows contain an invalid email address."
        );
      }

      return {
        name: normalizedRow.name,
        phone: normalizedRow.phone,
        email: normalizedRow.email || null,
        address: normalizedRow.address || null,
        status: "follow",
      };
    });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const inserted = [];

      for (const row of validatedRows) {
        const result = await client.query(
          `
            INSERT INTO customers (
              name,
              phone,
              email,
              address,
              status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
              id,
              name,
              phone,
              email,
              address,
              status
          `,
          [
            row.name,
            row.phone,
            row.email,
            row.address,
            row.status,
          ]
        );

        inserted.push(result.rows[0]);
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: `Imported ${inserted.length} customer(s) successfully`,
        data: inserted,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Customer import error:", error);

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        message: "One or more imported rows already exist.",
      });
    }

    return res.status(400).json({
      message: error.message || "Failed to import customers.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Dashboard Route
|--------------------------------------------------------------------------
*/

app.get("/api/dashboard", getDashboardStats);

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

const normalizeOutreachStatuses = async () => {
  await pool.query(`
    UPDATE customers
    SET status = CASE status
      WHEN 'new' THEN 'follow'
      WHEN 'follow-up' THEN 'follow'
      WHEN 'converted' THEN 'topup'
      WHEN 'closed' THEN 'topup'
      ELSE status
    END
    WHERE status IN ('new', 'follow-up', 'converted', 'closed')
  `);

  await pool.query(
    "ALTER TABLE customers ALTER COLUMN status SET DEFAULT 'follow'"
  );
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  normalizeOutreachStatuses().catch((error) => {
    console.error("Failed to normalize outreach statuses:", error);
  });
});