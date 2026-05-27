const express = require('express');
const router = express.Router();
const { Customer } = require("../../models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, username } = req.body;

    // Validate email format
        if (!validator.isEmail(email)) {
          return res.status(400).json({
            message: 'Invalid email format',
          });
        }
    
        // Check email exists
        const existingCustomer = await Customer.findOne({
          where: { email },
        });
    
        if (existingCustomer) {
          return res.status(400).json({
            message: 'Email already exists',
          });
        }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      username
    });

    return res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Create customer failed",
      error: error.message,
    });
  }
});

router.get('', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      // include: [{
      //   model: Order,
      //   as: 'orders',
      //   attributes: ['id', 'orderNumber', 'total', 'discount', 'orderDate', 'location'],
      // }],
    });
    res.json({
      message: 'Get all customers successfully',
      data: customers,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await Customer.findByPk(id, {
      include: [{
        model: Order,
        as: 'orders',
        attributes: ['id', 'orderNumber', 'total', 'discount', 'orderDate', 'location'],
      }],
    });
    res.json({
      message: 'Get customer successfully',
      data: customer,
    });
  } catch (error) {
    console.log(error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { firstName, lastName, phone, email, password, username } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        message: `Customer with id=${id} not found`,
      });
    }

    await customer.update({
      firstName,
      lastName,
      phone,
      email,
      password,
      username
    });

    res.json({
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Update customer failed',
      error: error.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        message: `Customer with id=${id} not found`,
      });
    }

    await customer.destroy();
    res.json({
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Delete customer failed',
      error: error.message,
    });
  }
});

module.exports = router;
