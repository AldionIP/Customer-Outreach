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

const getCustomerById = async (id) => {
  const result = await pool.query(
    `
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
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
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
    [
      name,
      phone,
      email || null,
      address || null,
    ]
  );

  return result.rows[0];
};

const updateCustomer = async (
  id,
  {
    name,
    phone,
    email,
    address,
    status,
  }
) => {
  const result = await pool.query(
    `
      UPDATE customers
      SET
        name = $1,
        phone = $2,
        email = $3,
        address = $4,
        status = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
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
    [
      name,
      phone,
      email || null,
      address || null,
      status,
      id,
    ]
  );

  return result.rows[0];
};

const deleteCustomer = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM customers
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};