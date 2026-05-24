const express = require('express');
const router = express.Router();
const { Product, Category, ProductImage } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');         
const fs = require('fs'); 

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Find category with images
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: "productImages",
          attributes: ["id", "imageUrl", "fileName"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: `Product with id=${id} not found`,
      });
    }

    // Delete category images from disk + DB
    if (product.productImages && product.productImages.length > 0) {
      for (const image of product.productImages) {
        const fileName = image.imageUrl.split("/").pop();

        const filePath = path.join(
          process.cwd(),
          "uploads/products",
          fileName,
        );

        // Delete physical file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Delete DB record
        await image.destroy();
      }
    }

    // Delete product
    await product.destroy();

    return res.json({
      message: `Product with id=${id} deleted successfully`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Delete product failed",
      error: error.message,
    });
  }
});

router.delete("/images/:imageId", async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);

    const image = await ProductImage.findOne({
      where: {
        id: imageId,
      },
    });
    if (!image) {
      return res.status(404).json({
        message: `Image with id=${imageId} not found`,
      });
    }

    // remove image from folder uploads
    const fileName = image.imageUrl.split("/").pop();

    const filePath = path.join(process.cwd(), "uploads/products", fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();
    res.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Delete image failed",
      error: error.message,
    });
  }
}); 

// Update Product
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, categoryId, price, qty, isActive } = req.body;
    const product = await Product.findByPk(id);
    if (!product) {
  return res.status(404).json({
    message: `Product id=${id} not found`,
  });
}

    // Update only provided fields
    if (name !== undefined) {
      product.name = name;
    }

    if (categoryId !== undefined) {
      product.categoryId = categoryId;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (qty !== undefined) {
      product.qty = qty;
    }

    if (isActive !== undefined) {
      product.isActive = isActive;
    }

    await product.save();

    res.json({
      message: `Product with id=${id} updated successfully`,
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Update Product failed",
      error: error.message,
    });
  }
});

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
    const { name, categoryId, price, qty } = req.body;

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
