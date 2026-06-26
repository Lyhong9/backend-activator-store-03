const express = require('express');
const router = express.Router();
const { User, UserImage } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');         
const fs = require('fs'); 
const { Op } = require('sequelize');

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await User.findByPk(id, {
      include: [{
        model: UserImage,
        as: 'userImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      }],
    });

    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} not found`,
      });
    }

    // Delete each image file from disk + DB record
    if (user.userImages && user.userImages.length > 0) {
      for (const image of user.userImages) {
        // Remove file from uploads/users folder
        const fileName = image.imageUrl.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads/users', fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Remove image record from DB
        await image.destroy();
      }
    }

    await user.destroy();
    res.json({
      message: `User with id=${id} deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Delete user failed',
      error: error.message,
    });
  }
});

router.delete("/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await UserImage.findOne({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      return res.status(404).json({
        message: `User Image id=${imageId} not found`,
      });
    }

    const fileName = image.imageUrl.split("/").pop();
    const filePath = path.join(process.cwd(), "uploads/users", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.destroy();

    return res.json({
      message: "User Image deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Delete user image failed",
      error: error.message,
    });
  }
});

// Image upload
router.post("/:id/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { file } = req.files;
    const userId = req.params.id;

    // validate user id
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: `User id=${userId} not found`,
      });
    }

    console.log("File", file);

    // UUI + file extension
    const fileName = `${uuidv4()}${path.extname(file.name)}`;

    //  Upload file to folder uploads/users
    //  Create file upload path
    const uploadPath = path.join(process.cwd(), "uploads/users", fileName);

    await file.mv(uploadPath);

    // Domain + fileName // domain.com/uploads/users/9871923712.png
    const domain = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${domain}/uploads/users/${fileName}`;

    const savedImage = await UserImage.create({
      userId,
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

router.get('', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereCondition = {};

    const search = req.query.search;

    if (search) {
      whereCondition.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where: whereCondition,
      distinct: true,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: UserImage,
          as: 'userImages',
          attributes: ['id', 'imageUrl', 'fileName'],
        },
      ],
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: 'Get all users successfully',
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Get all users failed',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const users = await User.findByPk(id, {
      include: [{
        model: UserImage,
        as: 'userImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      }],
    });
    res.json({
      message: 'Get user successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Get user failed',
      error: error.message,
    });
  }
});

module.exports = router;
