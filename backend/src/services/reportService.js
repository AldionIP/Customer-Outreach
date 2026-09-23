const pool = require("../config/database");

const getCustomerOutreachReport = async ({
  dateFrom,
  dateTo,
  statuses = [],
}) => {
  const values = [dateFrom, dateTo];
  const statusCondition = statuses.length
    ? `AND c.status = ANY($${values.length + 1}::text[])`
    : "";

  if (statuses.length) {
    values.push(statuses);
  }

  const result = await pool.query(
    `
      WITH latest_follow_up AS (
        SELECT DISTINCT ON (customer_id)
          customer_id,
          note,
          follow_up_date,
          created_at AS outreach_created_at
        FROM follow_ups
        ORDER BY customer_id, created_at DESC
      )
      SELECT
        c.id,
        to_char(COALESCE(
          (lf.follow_up_date AT TIME ZONE 'Asia/Jakarta')::date,
          (c.created_at AT TIME ZONE 'Asia/Jakarta')::date
        ), 'YYYY-MM-DD') AS report_date,
        c.name,
        c.phone,
        c.email,
        c.address,
        c.status,
        lf.note AS follow_up_note,
        lf.follow_up_date,
        lf.outreach_created_at,
        c.created_at,
        c.updated_at
      FROM customers c
      LEFT JOIN latest_follow_up lf ON lf.customer_id = c.id
      WHERE COALESCE(
        (lf.follow_up_date AT TIME ZONE 'Asia/Jakarta')::date,
        (c.created_at AT TIME ZONE 'Asia/Jakarta')::date
      ) BETWEEN $1::date AND $2::date
        ${statusCondition}
      ORDER BY report_date DESC, c.created_at DESC, c.name ASC
    `,
    values
  );

  return result.rows;
};

module.exports = {
  getCustomerOutreachReport,
};
