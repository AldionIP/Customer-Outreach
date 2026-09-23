const pool = require("../config/database");

const getAllCustomers = async ({
  search,
  status,
  page = 1,
  limit = 10,
} = {}) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        name ILIKE $${values.length}
        OR phone ILIKE $${values.length}
        OR email ILIKE $${values.length}
      )
    `);
  }

  if (status) {
    values.push(status);

    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM customers
      ${whereClause}
    `,
    values
  );

  const total = Number(countResult.rows[0].total);

  const offset = (page - 1) * limit;

  const dataValues = [...values, limit, offset];

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
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
    `,
    dataValues
  );

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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