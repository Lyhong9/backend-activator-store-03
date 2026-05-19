const express = require('express');
const router = express.Router();
const { Category, CategoryImage, Product } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');         
const fs = require('fs'); 

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const category = await Category.findByPk(id, {
      include: [{
        model: CategoryImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'fileName'],
      }],
    });

    if (!category) {
      return res.status(404).json({
        message: `Category with id=${id} not found`,
      });
    }

    // Delete each image file from disk + DB record
    if (category.images && category.images.length > 0) {
      for (const image of category.images) {
        // Remove file from uploads/categories folder
        const fileName = image.imageUrl.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads/categories', fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Remove image record from DB
        await image.destroy();
      }
    }

    await category.destroy();
    res.json({
      message: `Category with id=${id} deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Delete category failed',
      error: error.message,
    });
  }
});

router.delete("/images/:imageId", async (req, res) => {
  const { imageId } = req.params;

 const image = await CategoryImage.findOne({
    where: {
      id: imageId
    }
  })

  if(!image){
    return res(404).json({
      message: `Category Image id=${imageId} not found`
    })
  }

  // remove image from folder uploads
  // const fileName = image.imageUrl.split("/").pop()

  const filePath = path.join(process.cwd(), "../uploads/categories", fileName) // read root folder + uploads/categories + fileName

  if(fs.existsSync(filePath)){ // check if file exist in folder uploads/categories
    fs.unlinkSync(filePath) // remove file from folder uploads/categories
  }

  // remove data from db
  await image.destroy()

  return res.json({
    message: "Category Image deleted successfully"
  })

});

// Image upload
router.post("/:id/upload", async (req, res) => {
  try {
    // const file = req.files.file;
    // const productId = req.files.productId

    const { file } = req.files;
    const categoryId = req.params.id;

    // validate category id
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.json({
        message: `Category id=${categoryId} not found`,
      });
    }

    console.log("File", file);

    // UUI + file extension
    const fileName = `${uuidv4()}${path.extname(file.name)}`;

    //  Upload file to folder uploads/categories
    //  Create file upload path
    const uploadPath = path.join(process.cwd(), "uploads/categories", fileName);

    await file.mv(uploadPath);

    // Domain + fileName // domain.com/uploads/categories/9871923712.png
    const domain = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${domain}/uploads/categories/${fileName}`;

    const savedImage = await CategoryImage.create({
      categoryId,
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
    const { name, isActive } = req.body;

    const category = await Category.create({
      name,
      isActive: true,
    });

    res.json({
      message: 'Category register successfully',
      data: category,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: CategoryImage,
        as: 'categoryImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      },
      {
        model: Product,
        as: 'products',
      },
    ],
    });

    res.json({
      message: 'Get all categories successfully',
      data: categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Get all categories failed',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const category = await Category.findByPk(id, {
      include: [{
        model: CategoryImage,
        as: 'categoryImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      },
      {
        model: Product,
        as: 'products',
      },
    ],
    });

    if (!category) {
      return res.status(404).json({
        message: `Category with id=${id} not found`,
      });
    }

    res.json({
      message: 'Get category successfully',
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Get category failed',
      error: error.message,
    });
  }
});

module.exports = router;