const express = require('express');
const router = express.Router();
const { Product, Category, ProductImage } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');         
const fs = require('fs'); 

// Image upload
router.post("/:id/upload", async (req, res) => {
  try {
    // const file = req.files.file;
    // const productId = req.files.productId

    const { file } = req.files;
    const productId = req.params.id;

    // validate product id
    const product = await Product.findByPk(productId);
    if (!product) {
  return res.status(404).json({
    message: `Product id=${productId} not found`,
  });
}

    console.log("File", file);

    // UUI + file extension
    const fileName = `${uuidv4()}${path.extname(file.name)}`;

    //  Upload file to folder uploads/products
    //  Create file upload path
    const uploadPath = path.join(process.cwd(), "uploads/products", fileName);

    await file.mv(uploadPath);

    // Domain + fileName // domain.com/uploads/products/9871923712.png
    const domain = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${domain}/uploads/products/${fileName}`;

    const savedImage = await ProductImage.create({
      productId,
      imageUrl,
      fileName: file.name,
    });

    res.json({
      message: "Upload image successfully",
      data: savedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Upload image failed",
      error: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, categoryId, price, qty, isActive } = req.body;

    const product = await Product.create({
      name,
      categoryId,
      price,
      qty,
      isActive: true,
    });

    res.json({
      message: 'Product register successfully',
      data: product,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('', async (req, res) => {
  try {
    const products = await Product.findAll({
        include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages',
          attributes: ['id', 'imageUrl', 'fileName'],
        }
      ],
      });
    res.json({
      message: 'Get all Products successfully',
      data: products,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const products = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages',
          attributes: ['id', 'imageUrl', 'fileName'],
        }
      ]
    });
    res.json({
      message: 'Get Product successfully',
      data: products,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
