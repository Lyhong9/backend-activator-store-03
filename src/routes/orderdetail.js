const express = require('express');
const router = express.Router();
const { OrderDetail } = require('../../models');

router.get('', async (req, res) => {
  try {
    const orderDetails = await OrderDetail.findAll();
    res.json({
      message: 'Get all order details successfully',
      data: orderDetails,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Get all order details failed',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const orderDetail = await OrderDetail.findByPk(id);
    res.json({
      message: 'Get order detail successfully',
      data: orderDetail,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Get order detail failed',
      error: error.message,
    });
  }
});

// Delete order detail
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deletedOrderDetail = await OrderDetail.destroy({
      where: { id },
    });
    res.json({
      message: 'Order detail deleted successfully',
      data: deletedOrderDetail,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Delete order detail failed',
      error: error.message,
    });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const updatedOrderDetail = await OrderDetail.update(
      {
        orderId: req.body.orderId,
        productId: req.body.productId,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        qty: req.body.qty,
        amount: req.body.amount,
      },
      {
        where: { id },
      },
    );
    res.json({
      message: 'Order detail updated successfully',
      data: updatedOrderDetail,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Update order detail failed',
      error: error.message,
    });
  }
});

module.exports = router;
