const customerService = require("../services/customerService");

const getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();

    res.status(200).json({
      data: customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to get customers",
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const customer = await customerService.createCustomer({
      name,
      phone,
      email,
      address,
    });

    res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
};