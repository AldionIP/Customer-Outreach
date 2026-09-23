const pool = require("../config/database");

const getAllCustomers = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      phone,
      email,
      address,
      status,
      created_at,
      updated_at
    FROM customers
    ORDER BY created_at DESC
  `);

  return result.rows;
};

const createCustomer = async ({
  name,
  phone,
  email,
  address,
}) => {
  const result = await pool.query(
    `
      INSERT INTO customers (
        name,
        phone,
        email,
        address
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        phone,
        email,
        address,
        status,
        created_at,
        updated_at
    `,
    [name, phone, email || null, address || null]
  );

  return result.rows[0];
};

module.exports = {
  getAllCustomers,
  createCustomer,
};