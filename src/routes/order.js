const express = require('express');
const router = express.Router();
const { Order, Customer, OrderDetail, Product } = require('../../models');
// const generateDoc = require('../utils/generateOrderDoc');

router.post('/', async (req, res) => {
  try {
    console.log('Request body', req.body);
    const { items, discount, customerId } = req.body;

    const customer = await Customer.findByPk(customerId);
    console.log('Customer', customer);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
      });
    }

    const orderDetailsData = [];
    let total = 0;
    for (const item of items) {
      const { productId, qty } = item;

      // Get product info
      const product = await Product.findByPk(productId);
      if (!product) {
  return res.status(404).json({
    message: `Product id=${productId} not found`,
  });
}

      console.log('Product', product);
      const amount = product.price * qty;

      // total = total + amount
      total += amount;

      orderDetailsData.push({
        productId,
        productName: product.name,
        productPrice: product.price,
        qty,
        amount,
      });
    }

    console.log('OrderDetails', orderDetailsData);

    // Generate order number
    // const orderNumber = `ORD-${Date.now()}`;

    // Create order into db
    const createdOrder = await Order.create({
      customerId: customer.id,
      // orderNumber: orderNumber,
      orderNumber: generateInvoiceNumber(),
      total: total,
      discount: discount,
      orderDate: new Date(),
      location: "N/A",
    });

    console.log('Created order', createdOrder);

    // Create order detail into db

    const orderDetails = orderDetailsData.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      qty: item.qty,
      amount: item.amount,
      orderId: createdOrder.id,
    }));

    await OrderDetail.bulkCreate(orderDetails);

    const completedOrder = await Order.findByPk(createdOrder.id, {
      include: [
        // {
        //   model: Customer,
        //   as: 'customer',
        // },
        {
          model: OrderDetail,
          as: 'orderDetails',
        },
      ],
    });
    res.json({
      message: 'Order completed',
      data: completedOrder,
    });
  } catch (error) {
    console.log('Error', error);

    res.status(500).json({
      message: 'Create order failed',
      error: error.message,
    });
  }
});


function generateInvoiceNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `SalaIT-${year}${month}${day}-${hours}${minutes}`;
}

router.get('', async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json({
      message: 'Get all orders successfully',
      data: orders,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Get all orders failed',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const order = await Order.findByPk(id);
    res.json({
      message: 'Get order successfully',
      data: order,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Get order failed',
      error: error.message,
    });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const updatedOrder = await Order.update(
      {
        customerId: req.body.customerId,
        orderNumber: req.body.orderNumber,
        total: req.body.total,
        discount: req.body.discount,
        orderDate: req.body.orderDate,
        location: req.body.location,
      },
      {
        where: { id },
      },
    );
    res.json({
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Update order failed',
      error: error.message,
    });
  }
});

module.exports = router;
