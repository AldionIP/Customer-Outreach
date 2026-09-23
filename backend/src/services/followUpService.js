const pool = require("../config/database");

const createFollowUp = async ({
  customerId,
  note,
  followUpDate,
}) => {
  const result = await pool.query(
    `
      INSERT INTO follow_ups (
        customer_id,
        note,
        follow_up_date
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        customer_id,
        note,
        follow_up_date,
        created_at,
        updated_at
    `,
    [
      customerId,
      note,
      followUpDate || null,
    ]
  );

  return result.rows[0];
};

const getFollowUpsByCustomerId = async (customerId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        customer_id,
        note,
        follow_up_date,
        created_at,
        updated_at
      FROM follow_ups
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `,
    [customerId]
  );

  return result.rows;
};

const getFollowUpById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        id,
        customer_id,
        note,
        follow_up_date,
        created_at,
        updated_at
      FROM follow_ups
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const updateFollowUp = async (
  id,
  {
    note,
    followUpDate,
  }
) => {
  const result = await pool.query(
    `
      UPDATE follow_ups
      SET
        note = $1,
        follow_up_date = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING
        id,
        customer_id,
        note,
        follow_up_date,
        created_at,
        updated_at
    `,
    [
      note,
      followUpDate || null,
      id,
    ]
  );

  return result.rows[0];
};

const deleteFollowUp = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM follow_ups
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createFollowUp,
  getFollowUpsByCustomerId,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
};